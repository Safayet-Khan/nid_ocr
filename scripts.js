let cameraButton = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let clickButton = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
let submitButton = document.querySelector("#submit-button");
let flipBtn = document.querySelector('#flip-camera');
let shouldFaceUser = true;
let stream; // declare stream variable globally

// check whether we can use facingMode
let supports = navigator.mediaDevices.getSupportedConstraints();
if (supports['facingMode'] === true) {
  flipBtn.disabled = false;
}

cameraButton.addEventListener('click', async function() {
  let video_obj_cons = { video: true, audio: false }
  video_obj_cons.video = {facingMode: shouldFaceUser ? 'user' : 'environment'}
  // console.log(video_obj_cons.video)
  // alert(video_obj_cons)
  stream = await navigator.mediaDevices.getUserMedia(video_obj_cons);
  video.srcObject = stream;
  // video.facingMode = shouldFaceUser ? 'user' : 'environment'; // Corrected facingMode assignment

  // Adjust canvas size to match video dimensions
  video.addEventListener('loadedmetadata', function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
});

flipBtn.addEventListener('click', function() {
  if (stream == null) return;
  // we need to flip, stop everything
  stream.getTracks().forEach(t => {
    t.stop();
  });
  // toggle / flip
  shouldFaceUser = !shouldFaceUser;
  // alert(shouldFaceUser)
  cameraButton.click(); // Simulate a click event to start the camera with the new facingMode
});

clickButton.addEventListener('click', function() {
  canvas.getContext('2d').drawImage(video, 0, 0);
});

submitButton.addEventListener('click', function() {
  let imageDataUrl = canvas.toDataURL('image/jpeg');

  // Send the captured image data to the API endpoint
  fetch('/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image_data: imageDataUrl })
  })
    .then(response => response.json())
    .then(data => {
      // Process the response from the API
      // console.log(data);
      // Display the result
      // let resultContainer = document.createElement('div');

      // resultContainer = JSON.stringify(data);
      let resultContainer = data;
      let resultData;
      if ('message' in resultContainer) {
        console.log(resultContainer, typeof resultContainer);
        resultData = resultContainer.message;
      } else {
        console.log(resultContainer, typeof resultContainer);
        resultData = `<table class="table">
                      <tr>
                          <th>Name</th><th>DOB</th><th>NID</th>
                      </tr>
                      <tr>
                          <td>${resultContainer.name}</td>
                          <td>${resultContainer.dob}</td>
                          <td>${resultContainer.nid_no}</td>
                      </tr>
                  </table>`;
      }
      document.getElementById('result').innerHTML = resultData;
    })
    .catch(error => {
      console.error('Error sending image data:', error);
    });
});
