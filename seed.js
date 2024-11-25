const fileInput = document.getElementById("fileInput");
function predict() {
    if (fileInput.files.length>0) {
        alert("Predicting")
    }
    else {
        alert("Please select a file")
    }
    
}