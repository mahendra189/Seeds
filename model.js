const seeds_illustration = {
    'Brinjal Seeds': "./assets/seeds/brinjal.png",
    'Chilli Seeds': "./assets/seeds/chilli.png",
    'Cucumber Seeds': "./assets/seeds/cucumber.png",
    'Ladyfinger Seeds': "./assets/seeds/ladyfinger.jpg",
    'Pumpkin Seeds': "./assets/seeds/pumpkin.png",
    'Tomato Seeds': "./assets/seeds/tomato.png"
}
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
const resultDiv = document.getElementById("result");
const seedIllus = document.getElementById("illustration")
const loading = document.getElementById("loading")
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
    if (fileInput.files.length > 0) {
        try {
            const predict_btn = document.getElementById("predict")
            predict_btn.disabled = true;
            const featureArea = document.getElementById("feature")
            featureArea.innerHTML = `<div id="loading">
                    <img class="loading" src="assets/network.webp" alt="loading" width="150">
                </div>`;
            await new Promise((resolve) => setTimeout(resolve, 100));
            console.log(uploadBox.innerHTML)
            // Load ONNX model
            const session = await ort.InferenceSession.create('./model/model.onnx');

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
            featureArea.innerHTML = `<p>Neural Network🗺</p>`
            predict_btn.disabled = false;



        } catch (error) {
            console.error("Error during classification:", error);
        }
    } else {
        //alert 
        alert("Please Upload a image")
    }
}

// Handle file input and load image into canvas
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
        const ctx = document.getElementById("canvas")
        ctx.style.display = "block"
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
    const labels = [
        'Brinjal Seeds',
        'Chilli Seeds',
        'Cucumber Seeds',
        'Ladyfinger Seeds',
        'Pumpkin Seeds',
        'Tomato Seeds']
        ; // Replace with your actual labels
    resultDiv.textContent = `Prediction: ${labels[prediction]} (Class ${prediction})`;
    seedIllus.src = seeds_illustration[labels[prediction]]

}


function setLoading() {
    featureArea.innerHTML = `<div id="loading">
                            <img class="loading" src="assets/network.webp" alt="loading" width="150">
                        </div>`

}