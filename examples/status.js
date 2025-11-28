const ThermalPrinter = require('../node-thermal-printer').printer;
const Types = require('../node-thermal-printer').types;

async function testConnection() {
  const printer = new ThermalPrinter({
    type: Types.EPSON,
    interface: 'tcp://192.168.0.105:9100',
    options: {
      timeout: 10000, // Increase timeout to 10 seconds
      debug: true,    // Enable debug mode to see connection details
    },
  });

  try {
    // First, test if the printer is reachable
    console.log('Testing printer connection...');
    const isConnected = await printer.isPrinterConnected();

    if (!isConnected) {
      console.error('❌ Printer is not reachable. Please check:');
      console.error('   - IP address is correct (192.168.0.105)');
      console.error('   - Port 9100 is open and accessible');
      console.error('   - Printer is powered on and connected to network');
      console.error('   - No firewall blocking the connection');
      return;
    }

    console.log('✅ Printer is reachable!');

    // Now get the printer status
    console.log('Requesting printer status...');
    printer.getStatus();

    const status = await printer.execute({ waitForResponse: true });
    console.log('✅ Printer status received:', status);
    console.log('Status as hex:', status.toString('hex'));

  } catch (e) {
    console.error('❌ Connection failed:', e.message);

    // Provide specific troubleshooting advice based on error type
    if (e.code === 'ECONNREFUSED') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Check if the printer is powered on');
      console.error('   - Verify the IP address is correct');
      console.error('   - Ensure port 9100 is not blocked by firewall');
    } else if (e.code === 'ETIMEDOUT') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Network connection is slow or unstable');
      console.error('   - Try increasing the timeout value');
      console.error('   - Check network connectivity to the printer');
    } else if (e.code === 'ENOTFOUND') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - DNS resolution failed for the IP address');
      console.error('   - Check if the IP address is correct');
      console.error('   - Try using the printer\'s actual IP address');
    } else if (e.message === 'Socket timeout') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Printer is not responding within timeout period');
      console.error('   - Check if printer is busy or offline');
      console.error('   - Try increasing the timeout value');
    }
  }
}

testConnection();
