function handleError(error) {
  alert("摄像头无法正常使用，请检查是否占用或缺失");
  console.error(
    "navigator.MediaDevices.getUserMedia error: ",
    error.message,
    error.name
  );
}
/**
 * @author suke
 * device list init
 */
function initInnerLocalDevice() {
  const that = this;
  var localDevice = {
    audioIn: [],
    videoIn: [],
    audioOut: [],
  };
  let constraints = { video: true, audio: true };
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("浏览器不支持获取媒体设备");
    return;
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      stream.getTracks().forEach((trick) => {
        trick.stop();
      });
      // List cameras and microphones.
      navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
          devices.forEach(function (device) {
            let obj = {
              id: device.deviceId,
              kind: device.kind,
              label: device.label,
            };
            if (device.kind === "audioinput") {
              if (
                localDevice.audioIn.filter((e) => e.id === device.deviceId)
                  .length === 0
              ) {
                localDevice.audioIn.push(obj);
              }
            }
            if (device.kind === "audiooutput") {
              if (
                localDevice.audioOut.filter((e) => e.id === device.deviceId)
                  .length === 0
              ) {
                localDevice.audioOut.push(obj);
              }
            } else if (device.kind === "videoinput") {
              if (
                localDevice.videoIn.filter((e) => e.id === device.deviceId)
                  .length === 0
              ) {
                localDevice.videoIn.push(obj);
              }
            }
          });
        })
        .catch(handleError);
    })
    .catch(handleError);

  console.log(localDevice.audioIn, localDevice.videoIn, localDevice.audioOut);
}
initInnerLocalDevice();
