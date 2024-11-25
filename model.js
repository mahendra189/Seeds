const seeds_illustration = {
    'brinjal_seeds':"./assets/seeds/brinjal.png",
    'chilli_seeds':"./assets/seeds/chilli.png",
        'cucumber_seeds':"./assets/seeds/cucumber.png",
        'ladyfinger_seeds':"./assets/seeds/ladyfinger.jpg",
        'pumpkin_seeds':"./assets/seeds/pumpkin.png",
        'tomato_seeds':"./assets/seeds/tomato.png"
}
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
const resultDiv = document.getElementById("result");
const seedIllus = document.getElementById("illustration")

const uploadBox = document.getElementById("uploadBox");

// Update box content when a file is selected
fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        updateUploadBox(fileInput.files[0].name);

    }
});

// Drag and Drop Handlers
uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("drag-over");
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("drag-over");
});

uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.classList.remove("drag-over");

    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        updateUploadBox(e.dataTransfer.files[0].name);
    }
});

// Function to update upload box content
function updateUploadBox(fileName) {
    uploadBox.innerHTML = `<p>File Selected:</p><strong>${fileName}</strong>`;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 224, 224); // Resize image to 224x224
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}


// Function to load the ONNX model and classify the image
async function classifyImage() {
    try {
        // Load ONNX model
        const session = await ort.InferenceSession.create('./model/model.onnx');
        console.log("Model loaded successfully");

        // Preprocess image
        const inputTensor = preprocessImage();
        console.log(inputTensor)

        // Run inference
        const feeds = { 'input.1': inputTensor }; // Adjust `input` to your model's input name
        const output = await session.run(feeds);

        // Display results
        const outputTensor = output[Object.keys(output)[0]]; // Get first output tensor
        console.log(outputTensor);
        const prediction = argMax(outputTensor.data);
        displayResult(prediction);
    } catch (error) {
        console.error("Error during classification:", error);
    }
}

// Handle file input and load image into canvas
fileInput.addEventListener("change", () => {
    ctx.style.display = "block";
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 224, 224); // Resize image to 224x224
            }; 
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Preprocess image from canvas into a tensor
function preprocessImage() {
    const imageData = ctx.getImageData(0, 0, 224, 224); // Get pixel data
    const data = Float32Array.from(imageData.data)
        .filter((_, i) => i % 4 !== 3) // Remove alpha channel
        .map((x) => x / 255); // Normalize to [0, 1]

    // Convert to a tensor with shape [1, 3, 224, 224] (NCHW)
    return new ort.Tensor("float32", data, [1, 3, 224, 224]);
}

// Get the index of the highest value in the tensor
function argMax(array) {
    return array.indexOf(Math.max(...array));
}

// Display the classification result
function displayResult(prediction) {
    const labels = ['brinjal_seeds',
        'chilli_seeds',
        'cucumber_seeds',
        'ladyfinger_seeds',
        'pumpkin_seeds',
        'tomato_seeds']
        ; // Replace with your actual labels
    resultDiv.textContent = `Prediction: ${labels[prediction]} (Class ${prediction})`;
    seedIllus.src = seeds_illustration[labels[prediction]]

}
