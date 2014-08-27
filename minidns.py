"""
  A simple DNS server

  On linux run as root
  # Based on https://code.google.com/p/minidns/
"""
#!/usr/bin/env python

# -----------------------------
# Imports
# -----------------------------
import sys
import socket
import struct

# -----------------------------
# Imports
# -----------------------------
# DNS records to override
DNSES = {'www.google.com' : '127.0.0.1',}

# -----------------------------
# Code
# -----------------------------
# DNSQuery class from http://code.activestate.com/recipes/491264-mini-fake-dns-server/
class DNSQuery:
  def __init__(self, data):
    self.data=data
    self.domain=''

    tipo = (ord(data[2]) >> 3) & 15   # Opcode bits
    if tipo == 0:                     # Standard query
      ini=12
      lon=ord(data[ini])
      while lon != 0:
        self.domain+=data[ini+1:ini+lon+1]+'.'
        ini+=lon+1
        lon=ord(data[ini])

  def respuesta(self, ip):
    packet=''
    if self.domain:
      packet+=self.data[:2] + "\x81\x80"
      packet+=self.data[4:6] + self.data[4:6] + '\x00\x00\x00\x00'   # Questions and Answers Counts
      packet+=self.data[12:]                                         # Original Domain Name Question
      packet+='\xc0\x0c'                                             # Pointer to domain name
      packet+='\x00\x01\x00\x01\x00\x00\x00\x3c\x00\x04'             # Response type, ttl and resource data length -> 4 bytes
      packet+=str.join('',map(lambda x: chr(int(x)), ip.split('.'))) # 4bytes of IP
    return packet


def main():
  print "DNS Server starting"
  print "\nMappings:"
  print "*" * 10
  for key in DNSES.keys():
    print "\t%s -> %s" % (key, DNSES[key])

  try:
    udps = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udps.bind(('',53))
  except Exception, e:
    print "Failed to create socket on UDP port 53:", e
    sys.exit(1)
 
  print "\nWaiting for requests..."
  try:
    while 1:
      data, addr = udps.recvfrom(1024)
      p=DNSQuery(data)

      override = DNSES.has_key(p.domain)
      print "Requested domain: %s [Override=%s]" % (p.domain, override)
      if override:
        ip = DNSES[p.domain]
      else:
        try:
          ip = socket.gethostbyname(p.domain)
        except:
          print "\tFailed resolving hostname"
          continue

      udps.sendto(p.respuesta(ip), addr)
      print '\t%s -> %s' % (p.domain, ip)
  except KeyboardInterrupt:
    print '\nBye!'
    udps.close()

# Main entry point
if __name__ == '__main__':
  sys.exit(main())
