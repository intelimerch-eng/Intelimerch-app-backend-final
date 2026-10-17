async function getDeviceInfo() {
    try {
        // Get IP
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipResponse.json();

        // Wait until location is obtained
        const position = await getCoordinates();

        const { latitude, longitude, accuracy } = position.coords;

        const deviceInfo = {
            ip,
            latitude,
            longitude,
            accuracy
        };

        console.log(deviceInfo);

        // Coordinates are now available
        const location = await getLocation(longitude, latitude);

        console.log("Location:", location);

    } catch (error) {
        console.error("Error:", error);
    }
}


function getCoordinates() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}


async function getLocation(long, lat) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
        );

        if (!res.ok) {
            throw new Error(`Reverse geocoding failed: ${res.status}`);
        }

        const data = await res.json();

        return data;

    } catch (error) {
        throw error;
    }
}


getDeviceInfo();