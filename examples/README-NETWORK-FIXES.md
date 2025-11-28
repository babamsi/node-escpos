# Network Thermal Printer Socket Error Fixes

This directory contains fixed versions of the network printer connection scripts to resolve socket errors commonly encountered with thermal printers.

## Common Socket Errors and Solutions

### 1. **ECONNREFUSED** - Connection Refused
**Symptoms:** `Error: connect ECONNREFUSED 192.168.1.87:9100`
**Causes:**
- Printer is powered off
- Wrong IP address
- Port 9100 is blocked by firewall
- Printer is not accepting connections

**Solutions:**
- Verify printer is powered on
- Check IP address in printer settings
- Disable firewall or add exception for port 9100
- Restart the printer

### 2. **ETIMEDOUT** - Connection Timeout
**Symptoms:** `Error: connect ETIMEDOUT 192.168.1.87:9100`
**Causes:**
- Network is slow or congested
- Printer is busy processing
- Default timeout (3 seconds) is too short

**Solutions:**
- Increase timeout value in options
- Check network connectivity
- Wait for printer to finish processing
- Use the fixed scripts with longer timeouts

### 3. **Socket timeout** - Command Timeout
**Symptoms:** `Error: Socket timeout`
**Causes:**
- Printer not responding to commands
- Status commands not supported
- Wrong printer type selected

**Solutions:**
- Use simple test instead of status check
- Verify printer type (EPSON, STAR, etc.)
- Check printer documentation for supported commands

## Ethernet Connection Methods

### 1. **IP Address** (Most Common)
```javascript
const printer = new ThermalPrinter({
  type: Types.EPSON,
  interface: 'tcp://192.168.1.87:9100',
  options: { timeout: 10000, debug: true },
});
```

### 2. **Hostname** (If printer supports mDNS/Bonjour)
```javascript
const printer = new ThermalPrinter({
  type: Types.EPSON,
  interface: 'tcp://thermal-printer.local:9100',
  options: { timeout: 10000, debug: true },
});
```

### 3. **MAC Address** (Requires ARP resolution)
```javascript
// First resolve MAC to IP, then connect
const ip = await resolveMACtoIP('00:11:22:33:44:55');
const printer = new ThermalPrinter({
  type: Types.EPSON,
  interface: `tcp://${ip}:9100`,
  options: { timeout: 10000, debug: true },
});
```

### 4. **Environment Variables**
```bash
export PRINTER_IP=192.168.1.87
export PRINTER_HOSTNAME=thermal-printer.local
export PRINTER_PORT=9100
```

```javascript
const printerIP = process.env.PRINTER_IP || '192.168.1.87';
const printer = new ThermalPrinter({
  type: Types.EPSON,
  interface: `tcp://${printerIP}:9100`,
  options: { timeout: 10000, debug: true },
});
```

### 5. **Network Discovery**
Use the discovery script to automatically find printers on your network.

## Fixed Scripts

### 1. `status.js` - Fixed Status Checker
**What it does:** Tests printer connectivity and gets status information
**Improvements:**
- Increased timeout to 10 seconds
- Added connection testing before status request
- Enhanced error handling with specific troubleshooting advice
- Debug mode enabled for detailed logging

**Usage:**
```bash
node examples/status.js
```

### 2. `status-robust.js` - Advanced Status Checker
**What it does:** Comprehensive network diagnostics with step-by-step testing
**Features:**
- Basic network connectivity test
- Printer-specific connection test
- Status interpretation for Epson printers
- Detailed troubleshooting for different error types
- 15-second timeout for slow networks

**Usage:**
```bash
node examples/status-robust.js
```

### 3. `simple-test.js` - Basic Print Test
**What it does:** Simple test that prints a receipt to verify basic connectivity
**Best for:** Testing if the printer works without using status commands
**Features:**
- Basic connectivity test
- Simple test receipt printing
- No status commands (works with more printers)

**Usage:**
```bash
node examples/simple-test.js
```

### 4. `ethernet-discovery.js` - Network Discovery Tool
**What it does:** Automatically discovers thermal printers on your network
**Features:**
- Scans common printer IP ranges
- Uses arp-scan for device discovery
- Tests port 9100 connectivity
- Provides connection examples

**Usage:**
```bash
node examples/ethernet-discovery.js                    # Discover printers
node examples/ethernet-discovery.js 192.168.1.87      # Connect by IP
node examples/ethernet-discovery.js 00:11:22:33:44:55 mac  # Connect by MAC
node examples/ethernet-discovery.js printer-hostname hostname  # Connect by hostname
```

### 5. `connect-by-ethernet.js` - Connection Examples
**What it does:** Demonstrates different Ethernet connection methods
**Features:**
- IP address connection
- Hostname connection
- Network range scanning
- Fallback connection methods
- Environment variable configuration

**Usage:**
```bash
node examples/connect-by-ethernet.js          # Run all examples
node examples/connect-by-ethernet.js ip       # Connect by IP
node examples/connect-by-ethernet.js hostname # Connect by hostname
node examples/connect-by-ethernet.js scan     # Network scan
node examples/connect-by-ethernet.js fallback # Fallback method
node examples/connect-by-ethernet.js env      # Environment variables
```

## Configuration Options

All scripts use these improved configuration options:

```javascript
const printer = new ThermalPrinter({
  type: Types.EPSON,
  interface: 'tcp://192.168.1.87:9100',
  options: {
    timeout: 10000,  // 10 seconds (increased from 3)
    debug: true,     // Enable debug logging
  },
});
```

## Troubleshooting Steps

1. **Start with simple test:**
   ```bash
   node examples/simple-test.js
   ```

2. **If simple test fails, check network:**
   ```bash
   ping 192.168.1.87
   telnet 192.168.1.87 9100
   ```

3. **Try network discovery:**
   ```bash
   node examples/ethernet-discovery.js
   ```

4. **Try robust status checker:**
   ```bash
   node examples/status-robust.js
   ```

5. **Test different connection methods:**
   ```bash
   node examples/connect-by-ethernet.js
   ```

6. **Common fixes:**
   - Restart the printer
   - Check IP address in printer settings
   - Disable firewall temporarily
   - Use different printer type (STAR instead of EPSON)
   - Increase timeout value
   - Try different network identifiers (hostname, MAC)

## Printer Type Compatibility

Different printer types support different commands:

- **EPSON:** Full status support, most common
- **STAR:** Good compatibility, alternative to EPSON
- **TANCA:** Limited status support
- **BROTHER:** Basic support
- **DARUMA:** Limited support

If status commands fail, try switching printer type or use the simple test.

## Network Requirements

- **Port:** 9100 (standard thermal printer port)
- **Protocol:** TCP
- **Firewall:** Must allow outbound connections to port 9100
- **Network:** Stable connection (wired preferred over wireless)

## Finding Your Printer's IP Address

### Method 1: Printer Settings
- Check printer's network settings menu
- Look for "Network Configuration" or "IP Settings"
- Note the IP address, subnet mask, and gateway

### Method 2: Network Discovery
```bash
node examples/ethernet-discovery.js
```

### Method 3: Router Admin Panel
- Log into your router's admin panel
- Look for "Connected Devices" or "DHCP Clients"
- Find your printer in the list

### Method 4: Printer Test Page
- Print a network configuration page from your printer
- This usually shows IP address and network settings

### Method 5: Command Line Tools
```bash
# Scan your network for devices
nmap -sn 192.168.1.0/24

# Check ARP table for recently connected devices
arp -a

# Use arp-scan (Linux/Mac)
arp-scan --localnet
```

## Debug Mode

All scripts have debug mode enabled. This will show:
- Connection attempts
- Data sent to printer
- Response data (if any)
- Detailed error information

To disable debug mode, set `debug: false` in the options.

## Production Recommendations

For production use, consider:

1. **Static IP Address:** Configure your printer with a static IP
2. **Fallback Methods:** Use multiple connection methods
3. **Environment Variables:** Store configuration in environment variables
4. **Error Handling:** Implement proper error handling and retry logic
5. **Monitoring:** Add connection monitoring and alerting
6. **Documentation:** Document your printer's network configuration 