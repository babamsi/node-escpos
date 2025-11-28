# Ethernet Connection Quick Reference

## 🔗 Connection Methods

### 1. **IP Address** (Most Reliable)
```javascript
interface: 'tcp://192.168.1.87:9100'
```

### 2. **Hostname** (If printer supports mDNS)
```javascript
interface: 'tcp://thermal-printer.local:9100'
```

### 3. **MAC Address** (Requires ARP resolution)
```javascript
// First resolve MAC to IP
const ip = await resolveMACtoIP('00:11:22:33:44:55');
interface: `tcp://${ip}:9100`
```

### 4. **Environment Variables**
```bash
export PRINTER_IP=192.168.1.87
export PRINTER_HOSTNAME=thermal-printer.local
export PRINTER_PORT=9100
```

### 5. **Network Discovery**
```bash
node examples/ethernet-discovery.js
```

## 🛠️ Quick Test Commands

### Basic Connection Test
```bash
node examples/simple-test.js
```

### Status Check
```bash
node examples/status.js
```

### Network Discovery
```bash
node examples/ethernet-discovery.js
```

### All Connection Methods
```bash
node examples/connect-by-ethernet.js
```

## 🔍 Finding Your Printer's IP

### Method 1: Printer Settings
- Check printer's network configuration menu
- Look for "IP Settings" or "Network Info"

### Method 2: Router Admin
- Log into router (usually 192.168.1.1)
- Check "Connected Devices" or "DHCP Clients"

### Method 3: Command Line
```bash
# Scan network
nmap -sn 192.168.1.0/24

# Check ARP table
arp -a

# Use arp-scan
arp-scan --localnet
```

### Method 4: Discovery Script
```bash
node examples/ethernet-discovery.js
```

## ⚙️ Configuration Examples

### Basic Configuration
```javascript
const printer = new ThermalPrinter({
  type: Types.EPSON,
  interface: 'tcp://192.168.1.87:9100',
  options: {
    timeout: 10000,
    debug: true,
  },
});
```

### With Fallback
```javascript
const connectionMethods = [
  'tcp://192.168.1.87:9100',
  'tcp://192.168.1.100:9100',
  'tcp://thermal-printer.local:9100'
];

for (const interface of connectionMethods) {
  try {
    const printer = new ThermalPrinter({
      type: Types.EPSON,
      interface: interface,
      options: { timeout: 10000, debug: true },
    });
    
    if (await printer.isPrinterConnected()) {
      console.log(`Connected via: ${interface}`);
      break;
    }
  } catch (error) {
    console.log(`Failed: ${interface}`);
  }
}
```

### Environment Variables
```javascript
const printerIP = process.env.PRINTER_IP || '192.168.1.87';
const printerPort = process.env.PRINTER_PORT || '9100';

const printer = new ThermalPrinter({
  type: Types.EPSON,
  interface: `tcp://${printerIP}:${printerPort}`,
  options: { timeout: 10000, debug: true },
});
```

## 🚨 Common Issues & Solutions

### Connection Refused
- **Cause:** Printer off, wrong IP, firewall
- **Solution:** Check power, verify IP, disable firewall

### Connection Timeout
- **Cause:** Network slow, printer busy, short timeout
- **Solution:** Increase timeout, check network, wait

### Socket Timeout
- **Cause:** Printer not responding to commands
- **Solution:** Use simple test, check printer type

### Hostname Not Found
- **Cause:** DNS resolution failed
- **Solution:** Use IP address instead

## 📋 Troubleshooting Checklist

- [ ] Printer is powered on
- [ ] Network cable is connected
- [ ] IP address is correct
- [ ] Port 9100 is not blocked
- [ ] Printer type is correct (EPSON/STAR/etc.)
- [ ] Timeout is sufficient (10+ seconds)
- [ ] Debug mode is enabled for troubleshooting

## 🎯 Best Practices

1. **Use Static IP** for production
2. **Implement Fallback** methods
3. **Use Environment Variables** for configuration
4. **Enable Debug Mode** during development
5. **Test with Simple Script** first
6. **Document Network Settings**
7. **Monitor Connection Status**

## 📞 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `node examples/simple-test.js` | Basic connectivity test |
| `node examples/status.js` | Status check |
| `node examples/ethernet-discovery.js` | Find printers |
| `node examples/connect-by-ethernet.js` | All connection methods |
| `ping 192.168.1.87` | Test network reachability |
| `telnet 192.168.1.87 9100` | Test port connectivity |
| `arp -a` | View ARP table |
| `nmap -sn 192.168.1.0/24` | Scan network |

## 🔧 Advanced Configuration

### Custom Timeout
```javascript
options: { timeout: 15000 }  // 15 seconds
```

### Disable Debug
```javascript
options: { debug: false }
```

### Different Printer Types
```javascript
type: Types.STAR    // Instead of EPSON
type: Types.BROTHER // Alternative
type: Types.TANCA   // Another option
```

### Multiple Interfaces
```javascript
// Try different interfaces
const interfaces = [
  'tcp://192.168.1.87:9100',
  'tcp://192.168.1.100:9100',
  'tcp://thermal-printer.local:9100'
];
``` 