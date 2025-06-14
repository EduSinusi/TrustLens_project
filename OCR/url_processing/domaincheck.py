import socket
import dns.resolver
import whois
from datetime import datetime
import requests
import tldextract
import ssl
import google.cloud.logging
import OpenSSL
from typing import Dict, List, Optional, Set, Any
import re
import dns.reversename
import time
import json
from dateutil.parser import parse as date_parse

# Initialize Google Cloud Logging
client = google.cloud.logging.Client.from_service_account_json(
    r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"
)
logger = client.logger("domaincheck")

class DNSSecurityAnalyzer:
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        self.trusted_email_providers = {
            'google.com': 'Google Mail',
            'outlook.com': 'Microsoft Outlook',
            'amazonses.com': 'Amazon SES',
            'mailchimp.com': 'Mailchimp',
            'yahoo.com': 'Yahoo Mail',
            'zoho.com': 'Zoho Mail',
            'protonmail.com': 'ProtonMail'
        }
        self.blacklist_servers = ['zen.spamhaus.org']
        self.common_subdomains = ['www', 'mail', 'ftp', 'blog', 'shop']

    def get_certificate_creation_date(self, domain: str) -> Optional[datetime]:
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=self.timeout) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert(True)
                    x509 = OpenSSL.crypto.load_certificate(OpenSSL.crypto.FILETYPE_ASN1, cert)
                    not_before = x509.get_notBefore().decode('utf-8')
                    return datetime.strptime(not_before, '%Y%m%d%H%M%SZ')
        except (socket.timeout, ConnectionRefusedError, socket.gaierror):
            logger.log_text(f"Connection to {domain}:443 failed", severity="WARNING")
            return None
        except ssl.SSLError as e:
            logger.log_text(f"SSL error for {domain}: {e}", severity="WARNING")
            return None
        except Exception as e:
            logger.log_text(f"Certificate date failed for {domain}: {e}", severity="ERROR")
            return None

    def get_domain_age(self, domain: str) -> Dict[str, Any]:
        age_info = {'days': None, 'source': None, 'historical': False}
        try:
            info = whois.whois(domain)
            dates: List[datetime] = []
            if info.creation_date:
                if isinstance(info.creation_date, list):
                    dates.extend([d for d in info.creation_date if isinstance(d, datetime)])
                elif isinstance(info.creation_date, datetime):
                    dates.append(info.creation_date)
            if dates:
                oldest_date = min(dates)
                age_info['days'] = (datetime.now() - oldest_date).days
                age_info['source'] = 'WHOIS'
                return age_info
        except Exception as e:
            logger.log_text(f"WHOIS age error for {domain}: {e}", severity="ERROR")

        cert_date = self.get_certificate_creation_date(domain)
        if cert_date:
            age_info['days'] = (datetime.now() - cert_date).days
            age_info['source'] = 'SSL Certificate'
            return age_info

        try:
            response = requests.get(
                f"https://crt.sh/?q={domain}&output=json",
                timeout=self.timeout,
                headers={'User-Agent': 'DNSSecurityAnalyzer/1.0'}
            )
            response.raise_for_status()
            certs = response.json()
            if certs and isinstance(certs, list):
                entries = [date_parse(c['entry_timestamp']) for c in certs if 'entry_timestamp' in c]
                if entries:
                    age_info['days'] = (datetime.now() - min(entries)).days
                    age_info['source'] = 'crt.sh (Certificate Transparency)'
                    age_info['historical'] = True
                    return age_info
        except (requests.RequestException, ValueError) as e:
            logger.log_text(f"crt.sh lookup failed for {domain}: {e}", severity="ERROR")
        return age_info

    def analyze_mx_records(self, domain: str, mx_records: List) -> Dict[str, Any]:
        analysis: Dict[str, Any] = {
            'risk': 'low',
            'explanation': [],
            'providers': set()
        }
        for record in mx_records:
            mx_host = str(record.exchange).lower()
            for provider_domain, provider_name in self.trusted_email_providers.items():
                if provider_domain in mx_host:
                    analysis['providers'].add(provider_name)
            if not any(provider_domain in mx_host for provider_domain in self.trusted_email_providers):
                analysis['risk'] = 'medium'
                analysis['explanation'].append(f"Unrecognized MX host: {mx_host}")
        if analysis['providers']:
            analysis['explanation'].append(f"Uses trusted email provider(s): {', '.join(analysis['providers'])}")
            analysis['risk'] = 'low'
        return analysis

    def check_domain_existence(self, domain: str) -> bool:
        resolver = dns.resolver.Resolver()
        resolver.nameservers = ['8.8.8.8']
        try:
            resolver.resolve(domain, 'A')
            return True
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
            return False
        except Exception as e:
            logger.log_text(f"Alternative DNS check failed for {domain}: {e}", severity="WARNING")
            return False

    def analyze_spf_record(self, txt_records: List[str]) -> Dict[str, Any]:
        spf_record = next((r for r in txt_records if 'v=spf1' in r), None)
        analysis = {
            'check': 'SPF Record',
            'status': 'Not found' if not spf_record else 'Present',
            'risk': 'medium' if not spf_record else 'low',
            'explanation': []
        }
        if not spf_record:
            analysis['explanation'].append("No SPF record found - increases spoofing risk")
            analysis['explanation'].append("Recommendation: Add an SPF record (e.g., 'v=spf1 include:_spf.google.com ~all')")
        else:
            if '+all' in spf_record:
                analysis['risk'] = 'high'
                analysis['explanation'].append("SPF allows all senders (+all) - permits spoofing")
                analysis['explanation'].append("Recommendation: Use stricter policy (e.g., '-all' or '~all')")
            elif '-all' in spf_record:
                analysis['explanation'].append("Strict SPF policy (-all) enforced - good security")
            else:
                analysis['explanation'].append("SPF found, likely using soft fail (~all) or neutral policy")
        return analysis

    def reverse_dns_lookup(self, ip: str) -> Dict[str, Any]:
        analysis = {
            'check': 'Reverse DNS',
            'status': 'Not performed',
            'risk': 'low',
            'explanation': []
        }
        try:
            reverse_name = dns.reversename.from_address(ip)
            hostname = str(dns.resolver.resolve(reverse_name, 'PTR')[0])
            analysis['status'] = f"Resolved to {hostname}"
            if ip in hostname or tldextract.extract(hostname).domain == tldextract.extract(ip).domain:
                analysis['explanation'].append("Reverse DNS matches domain or related host - good consistency")
            else:
                analysis['risk'] = 'medium'
                analysis['explanation'].append("Reverse DNS does not match domain - potential misconfiguration")
                analysis['explanation'].append("Recommendation: Ensure PTR record aligns with domain")
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            analysis['status'] = 'No PTR record'
            analysis['risk'] = 'medium'
            analysis['explanation'].append("No reverse DNS record - reduces trust")
            analysis['explanation'].append("Recommendation: Configure a PTR record")
        return analysis

    def check_tls_versions(self, domain: str) -> Dict[str, Any]:
        analysis = {
            'check': 'TLS Versions',
            'status': 'Not checked',
            'risk': 'low',
            'explanation': []
        }
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=self.timeout) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    protocol = ssock.version()
                    ciphers = ssock.cipher()
                    analysis['status'] = f"Supported: {protocol}"
                    analysis['explanation'].append(f"TLS version: {protocol}")
                    analysis['explanation'].append(f"Cipher: {ciphers[0]} (Version: {ciphers[1]})")
                    if protocol in ['TLSv1', 'TLSv1.1']:
                        analysis['risk'] = 'high'
                        analysis['explanation'].append("Outdated TLS version detected - vulnerable to attacks")
                        analysis['explanation'].append("Recommendation: Upgrade to TLS 1.2 or 1.3")
                    elif protocol == 'TLSv1.2':
                        analysis['risk'] = 'low'
                        analysis['explanation'].append("TLS 1.2 is secure but consider upgrading to 1.3")
                    elif protocol == 'TLSv1.3':
                        analysis['explanation'].append("TLS 1.3 - most secure version")
        except (socket.timeout, ConnectionRefusedError, socket.gaierror):
            analysis['status'] = 'Unreachable'
            analysis['risk'] = 'medium'
            analysis['explanation'].append("Could not connect to check TLS versions")
        except ssl.SSLError as e:
            analysis['status'] = 'Failed'
            analysis['risk'] = 'high'
            analysis['explanation'].append(f"SSL error: {str(e)}")
        return analysis

    def check_http_availability(self, domain: str) -> Dict[str, Any]:
        analysis = {
            'check': 'HTTP/HTTPS Availability',
            'status': 'Not checked',
            'risk': 'low',
            'explanation': []
        }
        try:
            response = requests.get(f"https://{domain}", timeout=self.timeout, allow_redirects=True)
            analysis['status'] = f"HTTPS OK (Status: {response.status_code})"
            if response.url != f"https://{domain}/":
                analysis['explanation'].append(f"Redirected to: {response.url}")
            if not response.ok:
                analysis['risk'] = 'medium'
                analysis['explanation'].append("HTTPS returned non-200 status - potential issue")
            cert_date = self.get_certificate_creation_date(domain)
            if cert_date:
                cert_age = (datetime.now() - cert_date).days
                analysis['explanation'].append(f"Certificate issued {cert_age} days ago")
            hsts = 'strict-transport-security' in response.headers
            if hsts:
                analysis['explanation'].append("HSTS enabled - enforces HTTPS usage")
            else:
                analysis['risk'] = 'medium'
                analysis['explanation'].append("HSTS not enabled - no strict HTTPS enforcement")
                analysis['explanation'].append("Recommendation: Enable HSTS header")
        except requests.exceptions.SSLError:
            analysis['status'] = 'HTTPS Failed'
            analysis['risk'] = 'high'
            analysis['explanation'].append("Invalid or missing SSL certificate")
            analysis['explanation'].append("Recommendation: Install a valid SSL certificate")
        except requests.RequestException:
            try:
                response = requests.get(f"http://{domain}", timeout=self.timeout)
                analysis['status'] = 'HTTP Only'
                analysis['risk'] = 'medium'
                analysis['explanation'].append("No HTTPS support - data not encrypted")
                analysis['explanation'].append("Recommendation: Enable HTTPS with a valid certificate")
            except requests.RequestException:
                analysis['status'] = 'Unreachable'
                analysis['risk'] = 'medium'
                analysis['explanation'].append("Domain not reachable via HTTP/HTTPS")
        return analysis

    def check_blacklist(self, ip: str) -> Dict[str, Any]:
        analysis = {
            'check': 'Blacklist Status',
            'status': 'Not checked',
            'risk': 'low',
            'explanation': []
        }
        if not ip:
            analysis['explanation'].append("No IP to check against blacklist")
            return analysis
        try:
            reverse_ip = '.'.join(reversed(ip.split('.')))
            for bl_server in self.blacklist_servers:
                query = f"{reverse_ip}.{bl_server}"
                dns.resolver.resolve(query, 'A')
                analysis['status'] = 'Listed'
                analysis['risk'] = 'high'
                analysis['explanation'].append(f"IP listed in {bl_server} - potential spam/malware risk")
                analysis['explanation'].append("Recommendation: Investigate and delist if legitimate")
                break
        except dns.resolver.NXDOMAIN:
            analysis['status'] = 'Not listed'
            analysis['explanation'].append("IP not found in common blacklists - good reputation")
        except Exception as e:
            analysis['explanation'].append(f"Blacklist check failed: {str(e)}")
        return analysis

    def get_geoip_info(self, ip: str) -> Dict[str, Any]:
        analysis = {
            'check': 'GeoIP Location',
            'status': 'Not checked',
            'risk': 'low',
            'explanation': []
        }
        if not ip:
            analysis['explanation'].append("No IP to perform GeoIP lookup")
            return analysis
        try:
            response = requests.get(f"http://ip-api.com/json/{ip}", timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            if data['status'] == 'success':
                analysis['status'] = f"{data['city']}, {data['country']} (ISP: {data['isp']})"
                analysis['explanation'].append(f"IP located in {data['country']} - hosted by {data['isp']}")
            else:
                analysis['explanation'].append("GeoIP lookup failed - invalid IP data")
        except requests.RequestException as e:
            analysis['explanation'].append(f"GeoIP lookup failed: {str(e)}")
        return analysis

    def check_subdomains(self, domain: str) -> Dict[str, Any]:
        analysis = {
            'check': 'Subdomain Enumeration',
            'status': 'Not checked',
            'risk': 'low',
            'explanation': []
        }
        found_subdomains = []
        for sub in self.common_subdomains:
            subdomain = f"{sub}.{domain}"
            try:
                socket.gethostbyname(subdomain)
                found_subdomains.append(subdomain)
            except socket.gaierror:
                continue
        if found_subdomains:
            analysis['status'] = f"Found: {', '.join(found_subdomains)}"
            analysis['explanation'].append(f"Active subdomains detected: {len(found_subdomains)}")
            analysis['explanation'].append("Recommendation: Verify these are intentional and secure")
        else:
            analysis['status'] = 'None found'
            analysis['explanation'].append("No common subdomains detected")
        return analysis

    def check_caa_records(self, domain: str) -> Dict[str, Any]:
        analysis = {
            'check': 'CAA Records',
            'status': 'Not checked',
            'risk': 'low',
            'explanation': []
        }
        try:
            caa_records = dns.resolver.resolve(domain, 'CAA')
            caa_list = [str(r) for r in caa_records]
            analysis['status'] = f"Found: {len(caa_list)} records"
            analysis['explanation'].append(f"CAA records present: {', '.join(caa_list)}")
            analysis['explanation'].append("Ensures only authorized CAs can issue certificates")
        except dns.resolver.NoAnswer:
            analysis['status'] = 'Not found'
            analysis['risk'] = 'medium'
            analysis['explanation'].append("No CAA records - unrestricted certificate issuance")
            analysis['explanation'].append("Recommendation: Add CAA records (e.g., '0 issue \"letsencrypt.org\"')")
        except Exception as e:
            analysis['explanation'].append(f"CAA check failed: {str(e)}")
        return analysis

    def check_ipv6_support(self, domain: str) -> Dict[str, Any]:
        analysis = {
            'check': 'IPv6 Support',
            'status': 'Not checked',
            'risk': 'low',
            'explanation': []
        }
        try:
            resolver = dns.resolver.Resolver()
            resolver.nameservers = ['8.8.8.8']
            answers = resolver.resolve(domain, 'AAAA')
            ipv6_addresses = [r.address for r in answers]
            analysis['status'] = f"Found: {', '.join(ipv6_addresses)}"
            analysis['explanation'].append(f"IPv6 supported with {len(ipv6_addresses)} address(es)")
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            analysis['status'] = 'Not found'
            analysis['explanation'].append("No IPv6 (AAAA) records - IPv4 only")
        except Exception as e:
            analysis['explanation'].append(f"IPv6 check failed: {str(e)}")
        return analysis

    def enhanced_dns_check(self, url: str) -> Dict[str, Any]:
        results: Dict[str, Any] = {
            'domain': '',
            'ip': None,
            'ipv6': [],
            'age_info': None,
            'checks': [],
            'risk_summary': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0},
            'security_score': 100
        }
        
        logger.log_text(f"Starting analysis for {url}", severity="INFO")
        try:
            if not re.match(r'^https?://[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', url):
                raise ValueError("Invalid URL format")

            extracted = tldextract.extract(url)
            domain = f"{extracted.domain}.{extracted.suffix}"
            results['domain'] = domain
            logger.log_text(f"Extracted domain: {domain}", severity="INFO")

            try:
                start_time = time.time()
                ip = socket.gethostbyname(domain)
                dns_time = (time.time() - start_time) * 1000
                results['ip'] = ip
                results['checks'].append({
                    'check': 'DNS Resolution',
                    'status': 'Exists',
                    'risk': 'low',
                    'explanation': [
                        f"Domain resolved to {ip}",
                        f"DNS response time: {dns_time:.2f} ms"
                    ]
                })
                results['risk_summary']['low'] += 1
                if dns_time > 500:
                    results['checks'][-1]['risk'] = 'medium'
                    results['checks'][-1]['explanation'].append("Slow DNS response - potential performance issue")
                    results['risk_summary']['low'] -= 1
                    results['risk_summary']['medium'] += 1
                    results['security_score'] -= 5
                logger.log_text(f"DNS resolved to {ip} in {dns_time:.2f} ms", severity="INFO")
            except socket.gaierror as e:
                logger.log_text(f"DNS resolution failed: {e}", severity="WARNING")
                if not self.check_domain_existence(domain):
                    results['checks'].append({
                        'check': 'DNS Resolution',
                        'status': 'Non-existent',
                        'risk': 'N/A',
                        'explanation': [
                            "Domain does not exist in DNS.",
                            "Possible typo or unregistered domain.",
                            "Recommendation: Verify the domain name or contact the domain owner."
                        ]
                    })
                    results['status'] = "Unknown"
                    results['message'] = "Domain does not exist in DNS"
                    results['ip'] = None
                    results['ipv6'] = []
                    results['age_info'] = None
                    results['risk_summary'] = {
                        'critical': 0,
                        'high': 0,
                        'medium': 0,
                        'low': 0
                    }
                    results['security_score'] = 0
                    logger.log_text(f"Domain {domain} does not exist - returning Unknown status", severity="INFO")
                    return results
                else:
                    results['checks'].append({
                        'check': 'DNS Resolution',
                        'status': 'Failed',
                        'risk': 'medium',
                        'explanation': [f"DNS resolution failed: {str(e)}", "Possible temporary DNS issue"]
                    })
                    results['risk_summary']['medium'] += 1
                    results['security_score'] -= 20

            try:
                age_info = self.get_domain_age(domain)
                results['age_info'] = age_info
                age_analysis = {
                    'check': 'Domain Age',
                    'status': f"{age_info['days']} days" if age_info['days'] else "Unknown",
                    'risk': 'medium' if age_info['days'] and age_info['days'] < 7 else 'low',
                    'explanation': []
                }
                if age_info['days']:
                    if age_info['days'] < 7:
                        age_analysis['explanation'].append("New domain (<7 days) - higher phishing risk")
                        results['security_score'] -= 15
                    else:
                        age_analysis['explanation'].append("Established domain - lower inherent risk")
                    age_analysis['explanation'].append(f"Source: {age_info['source']}")
                    if age_info['historical']:
                        age_analysis['explanation'].append("Based on historical certificate data")
                else:
                    age_analysis['explanation'].append("Could not determine registration date")
                    results['security_score'] -= 10
                results['checks'].append(age_analysis)
                results['risk_summary'][age_analysis['risk']] += 1
                logger.log_text(f"Domain age: {age_info['days']} days from {age_info['source']}", severity="INFO")
            except Exception as e:
                logger.log_text(f"Domain age check failed: {e}", severity="ERROR")

            try:
                mx_records = dns.resolver.resolve(domain, 'MX')
                mx_analysis = self.analyze_mx_records(domain, mx_records)
                results['checks'].append({
                    'check': 'MX Records',
                    'status': 'Present',
                    'risk': mx_analysis['risk'],
                    'explanation': mx_analysis['explanation']
                })
                results['risk_summary'][mx_analysis['risk']] += 1
                if mx_analysis['risk'] == 'medium':
                    results['security_score'] -= 10
            except dns.resolver.NoAnswer:
                results['checks'].append({
                    'check': 'MX Records',
                    'status': 'Not found',
                    'risk': 'low',
                    'explanation': ["No email server configured - reduces phishing risk"]
                })
                results['risk_summary']['low'] += 1
            except Exception as e:
                logger.log_text(f"MX records check failed: {e}", severity="ERROR")

            try:
                txt_records = [r.to_text() for r in dns.resolver.resolve(domain, 'TXT')]
                spf_analysis = self.analyze_spf_record(txt_records)
                results['checks'].append(spf_analysis)
                results['risk_summary'][spf_analysis['risk']] += 1
                if spf_analysis['risk'] == 'medium':
                    results['security_score'] -= 10
                elif spf_analysis['risk'] == 'high':
                    results['security_score'] -= 20

                dkim = any('v=DKIM1' in r for r in txt_records)
                dmarc = any('v=DMARC1' in r for r in txt_records)
                email_security = {
                    'check': 'DKIM/DMARC',
                    'status': [],
                    'risk': 'low',
                    'explanation': []
                }
                if not dkim:
                    email_security['status'].append('DKIM missing')
                    email_security['risk'] = 'medium'
                    email_security['explanation'].append("DKIM missing - reduces email authenticity")
                    results['security_score'] -= 10
                if not dmarc:
                    email_security['status'].append('DMARC missing')
                    email_security['risk'] = 'medium'
                    email_security['explanation'].append("DMARC missing - vulnerable to domain spoofing")
                    results['security_score'] -= 10
                if email_security['status']:
                    email_security['status'] = ', '.join(email_security['status'])
                else:
                    email_security['status'] = 'Complete'
                    email_security['explanation'].append("DKIM and DMARC present - strong email security")
                results['checks'].append(email_security)
                results['risk_summary'][email_security['risk']] += 1
            except dns.resolver.NoAnswer:
                results['checks'].append({
                    'check': 'Email Security',
                    'status': 'No TXT records',
                    'risk': 'high',
                    'explanation': ["Missing all email security records (SPF/DKIM/DMARC)"]
                })
                results['risk_summary']['high'] += 1
                results['security_score'] -= 30
            except Exception as e:
                logger.log_text(f"Email security check failed: {e}", severity="ERROR")

            try:
                dns.resolver.resolve(domain, 'DNSKEY')
                results['checks'].append({
                    'check': 'DNSSEC',
                    'status': 'Enabled',
                    'risk': 'low',
                    'explanation': ["DNSSEC configured - enhances domain security"]
                })
                results['risk_summary']['low'] += 1
            except dns.resolver.NoAnswer:
                results['checks'].append({
                    'check': 'DNSSEC',
                    'status': 'Not enabled',
                    'risk': 'medium',
                    'explanation': ["DNSSEC not configured - vulnerable to DNS spoofing"]
                })
                results['risk_summary']['medium'] += 1
                results['security_score'] -= 10
            except Exception as e:
                logger.log_text(f"DNSSEC check failed: {e}", severity="ERROR")

            try:
                ipv6_analysis = self.check_ipv6_support(domain)
                results['ipv6'] = ipv6_analysis['status'].replace("Found: ", "").split(", ") if "Found" in ipv6_analysis['status'] else []
                results['checks'].append(ipv6_analysis)
                results['risk_summary'][ipv6_analysis['risk']] += 1
            except Exception as e:
                logger.log_text(f"IPv6 check failed: {e}", severity="ERROR")

            try:
                tls_analysis = self.check_tls_versions(domain)
                results['checks'].append(tls_analysis)
                results['risk_summary'][tls_analysis['risk']] += 1
                if tls_analysis['risk'] == 'high':
                    results['security_score'] -= 20
                elif tls_analysis['risk'] == 'medium':
                    results['security_score'] -= 10
            except Exception as e:
                logger.log_text(f"TLS versions check failed: {e}", severity="ERROR")

            try:
                reverse_analysis = self.reverse_dns_lookup(ip)
                results['checks'].append(reverse_analysis)
                results['risk_summary'][reverse_analysis['risk']] += 1
                if reverse_analysis['risk'] == 'medium':
                    results['security_score'] -= 10
            except Exception as e:
                logger.log_text(f"Reverse DNS check failed: {e}", severity="ERROR")

            try:
                http_analysis = self.check_http_availability(domain)
                results['checks'].append(http_analysis)
                results['risk_summary'][http_analysis['risk']] += 1
                if http_analysis['risk'] == 'medium':
                    results['security_score'] -= 15
                elif http_analysis['risk'] == 'high':
                    results['security_score'] -= 25
            except Exception as e:
                logger.log_text(f"HTTP/HTTPS check failed: {e}", severity="ERROR")

            try:
                blacklist_analysis = self.check_blacklist(ip)
                results['checks'].append(blacklist_analysis)
                results['risk_summary'][blacklist_analysis['risk']] += 1
                if blacklist_analysis['risk'] == 'high':
                    results['security_score'] -= 30
            except Exception as e:
                logger.log_text(f"Blacklist check failed: {e}", severity="ERROR")

            try:
                geoip_analysis = self.get_geoip_info(ip)
                results['checks'].append(geoip_analysis)
                results['risk_summary'][geoip_analysis['risk']] += 1
            except Exception as e:
                logger.log_text(f"GeoIP check failed: {e}", severity="ERROR")

            try:
                subdomain_analysis = self.check_subdomains(domain)
                results['checks'].append(subdomain_analysis)
                results['risk_summary'][subdomain_analysis['risk']] += 1
            except Exception as e:
                logger.log_text(f"Subdomain check failed: {e}", severity="ERROR")

            try:
                caa_analysis = self.check_caa_records(domain)
                results['checks'].append(caa_analysis)
                results['risk_summary'][caa_analysis['risk']] += 1
                if caa_analysis['risk'] == 'medium':
                    results['security_score'] -= 10
            except Exception as e:
                logger.log_text(f"CAA check failed: {e}", severity="ERROR")

            results['security_score'] = max(0, min(100, results['security_score']))
            logger.log_text(f"Analysis completed for {domain} with score {results['security_score']}", severity="INFO")

        except Exception as e:
            logger.log_text(f"Critical failure in analysis for {url}: {str(e)}", severity="ERROR")
            results['checks'].append({
                'check': 'Analysis Error',
                'status': 'Failed',
                'risk': 'high',
                'explanation': [f"Critical error during analysis: {str(e)}"]
            })
            results['risk_summary']['high'] += 1
            results['security_score'] -= 20

        return results

def check_domain_security(url: str) -> dict:
    analyzer = DNSSecurityAnalyzer(timeout=10)
    result = analyzer.enhanced_dns_check(url)

    dns_check = next((check for check in result['checks'] if check['check'] == 'DNS Resolution'), None)
    if dns_check and dns_check['status'] == 'Non-existent':
        logger.log_text(f"Domain does not exist for {url}", severity="INFO")
        return {
            "status": "Non-existent",
            "message": "Domain does not exist in DNS",
            "details": result
        }

    security_score = result['security_score']
    risk_summary = result['risk_summary']
    critical_risks = risk_summary['critical']
    high_risks = risk_summary['high']
    medium_risks = risk_summary['medium']

    if critical_risks > 0 or high_risks >= 2:
        status = "Unsafe"
        message = "High risk detected in DNS security analysis"
    elif (critical_risks == 0 and high_risks == 1) or \
         (critical_risks == 0 and high_risks == 0 and medium_risks > 6) or \
         (critical_risks == 0 and high_risks == 0 and medium_risks <= 6 and security_score < 25):
        status = "Potentially Unsafe"
        message = "Moderate risk detected in DNS security analysis"
    elif critical_risks == 0 and high_risks == 0 and medium_risks <= 6 and security_score >= 25:
        status = "Safe"
        message = "Low risk detected in DNS security analysis"
    else:
        status = "Unknown"
        message = "Insufficient data to determine safety"

    logger.log_struct({
        "message": "Domain security check completed",
        "url": url,
        "status": status,
        "security_score": security_score
    }, severity="INFO")
    return {
        "status": status,
        "message": message,
        "details": result
    }

if __name__ == "__main__":
    result = check_domain_security("https://google.com")
    logger.log_struct({
        "message": "Test domain security check",
        "url": "https://google.com",
        "result": result
    }, severity="INFO")