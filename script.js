const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const removeBgButton = document.getElementById('remove-bg');
const downloadButton = document.getElementById('download');
const outputImage = document.getElementById('output');

// Set canvas size for capturing
const captureSize = 38; // 4 inches * 96 PPI
canvas.width = captureSize;
canvas.height = captureSize;
video.width = captureSize;
video.height = captureSize;

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error('Error accessing camera: ', err);
    });

// Capture the image from the video
captureButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
});

// Remove background using remove.bg API
removeBgButton.addEventListener('click', () => {
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image_file', blob);
        formData.append('size', 'auto'); // Optional, specify image size

        const apiKey = 'qFaH1zMXRDtAU9uJooYMWPAp'; // Your API key

        fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            outputImage.src = imageUrl;
            outputImage.style.display = 'block';
            downloadButton.style.display = 'inline';
        })
        .catch(err => {
            console.error('Error removing background: ', err);
        });
    }, 'image/png');
});

// Download the processed image at a larger size
downloadButton.addEventListener('click', () => {
    const downloadSize = 1200; // Desired download size (e.g., 4 inches * 300 DPI)

    // Create a larger canvas for the download
    const largerCanvas = document.createElement('canvas');
    largerCanvas.width = downloadSize;
    largerCanvas.height = downloadSize;
    const largerContext = largerCanvas.getContext('2d');

    const image = new Image();
    image.src = outputImage.src;
    image.onload = () => {
        // Draw the image on the larger canvas, scaling up if necessary
        largerContext.drawImage(image, 0, 0, downloadSize, downloadSize);

        // Convert to blob and download
        largerCanvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'processed-image.png';
            link.click();
        }, 'image/png');
    };
});
