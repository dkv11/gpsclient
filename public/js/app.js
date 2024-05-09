const map = L.map('map').setView([0, 0], 2); // Default to a global view
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = {}; // Store markers by IMEI
const tableBody = document.querySelector('#data-table tbody'); // Get the table body element

// Connect to WebSocket server
const socket = io.connect('https://ae3a-103-243-60-35.ngrok-free.app');

// Function to subscribe to a device by IMEI
function subscribeToIMEI(imei) {
    socket.emit('trackDevice', imei);
    console.log(`Subscribed to track device with IMEI: ${imei}`);
}
function updateTable(data) {
    tableBody.innerHTML = ''; // Clear previous data

    // Create a row for each data field
    Object.entries(data).forEach(([key, value]) => {
        const row = tableBody.insertRow();
        const cellKey = row.insertCell(0);
        const cellValue = row.insertCell(1);
        cellKey.textContent = key;
       // Check if value is an object, if so, stringify it; otherwise, display the value directly
       cellValue.textContent = (value === null) ? 'null' : ((typeof value === 'object' && value !== null) ? JSON.stringify(value) : value);
    });
    console.log(`Table updated with data for IMEI: ${data.imei}`);
}

// Function to stop tracking a device by IMEI
function stopTrackingIMEI(imei) {
    socket.emit('stopTrackingDevice', imei);
    if (markers[imei]) {
        map.removeLayer(markers[imei]);
        delete markers[imei];
    }
}

// Handle incoming GPS data
socket.on('gpsData', function(data) {
    console.log("Received GPS data:", data);
    updateTable(data);
    const { imei, lat, lon } = data;
     // Only process map updates if latitude and longitude are not null
    if (lat && lon && lat.degrees !== null && lon.degrees !== null) {
        const position = [lat.degrees, lon.degrees];

        if (!markers[imei]) {
            markers[imei] = L.marker(position, { title: `IMEI: ${imei}` }).addTo(map);
        } else {
            markers[imei].setLatLng(position);
        }

        map.setView(position, 13); // Focus on the updated position
    }
   
});


// Example: Subscribe to a device
subscribeToIMEI('0866436050434744');



