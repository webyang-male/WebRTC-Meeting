function handleError(error) {
  // alert("摄像头无法正常使用，请检查是否占用或缺失")
  console.error(
    "navigator.MediaDevices.getUserMedia error: ",
    error.message,
    error.name
  );
}

/**
 * 获取屏幕分享的媒体流
 * @returns {Promise<void>}
 */
async function getShareMedia() {
  const constraints = {
    video: { width: 1920, height: 1080 }, //限制媒体宽高
    audio: false, //注意这里为true和false的区别
  };
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  return await navigator.mediaDevices
    .getDisplayMedia(constraints)
    .catch(handleError);
}
try {
  getShareMedia();
} catch {
  handleError;
}

/**
 * device list init
 */
var localDevice = null;
function initInnerLocalDevice() {
  const that = this;
  localDevice = {
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
    .then(() => {
      console.log(localDevice);
      console.log("audioIn", localDevice.audioIn);
      console.log("audioOut", localDevice.audioOut);
      console.log("videoIn", localDevice.videoIn);
    })
    .catch(handleError);
}
new Vue({
  el: "#app",
  data() {
    return {
      localDevice: {
        audioIn: [],
        videoIn: [],
        audioOut: [],
      },
      formInline: {
        videoId: undefined,
        audioInId: undefined,
        audioOutId: undefined,
        width: 1080,
        height: 720,
        frameRate: 24,
      },
    };
  },
  created() {
    initInnerLocalDevice();
    this.localDevice = localDevice;
  },
  methods: {
    async onSubmit() {
      let domId = "localdemo01";
      let video = document.getElementById(domId);
      let stream = video.srcObject;
      if (stream) {
        stream.getAudioTracks().forEach((e) => {
          stream.removeTrack(e);
        });
        stream.getVideoTracks().forEach((e) => {
          stream.removeTrack(e);
        });
      }

      let newStream = await this.getTargetDeviceMedia(
        this.formInline.videoId,
        this.formInline.audioInId
      );
      video.srcObject = newStream;
      video.muted = true;
    },
    /**
     * 获取设备 stream
     * @param constraints
     * @returns {Promise<MediaStream>}
     */
    async getLocalUserMedia(constraints) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    },
    /**
     * 获取指定媒体设备id对应的媒体流
     * @author suke
     * @param videoId
     * @param audioId
     * @returns {Promise<void>}
     */
    async getTargetDeviceMedia(videoId, audioId) {
      const constraints = {
        audio: { deviceId: audioId ? { exact: audioId } : undefined },
        video: {
          deviceId: videoId ? { exact: videoId } : undefined,
          width: this.formInline.width,
          height: this.formInline.height,
          frameRate: { ideal: this.formInline.frameRate, max: 24 },
        },
      };
      //清除当前标签页中没有销毁的媒体流
      if (window.stream) {
        window.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      return await this.getLocalUserMedia(constraints).catch(handleError);
    },
  },
  mounted: function () {},
});
