/* FCMS receipt / voucher camera helper */
(function () {
  if (window.FCMSReceiptCamera) return;

  function escapeAttr(value) {
    return String(value || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function dataUrlToFile(dataUrl, name='receipt-photo.jpg') {
    const parts = dataUrl.split(',');
    const mime = (parts[0].match(/:(.*?);/) || [,'image/jpeg'])[1];
    const bytes = atob(parts[1]);
    const arr = new Uint8Array(bytes.length);
    for (let i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
    return new File([arr], name, {type:mime});
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=reject;
      reader.readAsDataURL(file);
    });
  }

  function resizeImage(dataUrl, maxSide=1280, quality=.72) {
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.onerror=reject;
      img.src=dataUrl;
    });
  }

  function ensureModal() {
    let modal=document.getElementById('fcmsCameraModal');
    if (modal) return modal;
    modal=document.createElement('div');
    modal.id='fcmsCameraModal';
    modal.className='fcms-camera-modal';
    modal.innerHTML=`
      <div class="fcms-camera-backdrop"></div>
      <div class="fcms-camera-dialog" role="dialog" aria-modal="true" aria-labelledby="fcmsCameraTitle">
        <div class="fcms-camera-head">
          <div><div class="fcms-camera-kicker">FCMS</div><h3 id="fcmsCameraTitle">Take receipt photo</h3></div>
          <button type="button" class="fcms-camera-close" aria-label="Close"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="fcms-camera-body">
          <div class="fcms-camera-frame">
            <video id="fcmsCameraVideo" autoplay playsinline muted></video>
            <div class="fcms-camera-guide"></div>
            <div id="fcmsCameraStatus" class="fcms-camera-status">Allow camera access to continue.</div>
          </div>
          <canvas id="fcmsCameraCanvas" class="d-none"></canvas>
          <div class="fcms-camera-actions">
            <button type="button" class="btn btn-light" id="fcmsCameraCancel"><i class="bi bi-arrow-left me-1"></i>Cancel</button>
            <button type="button" class="btn btn-primary" id="fcmsCameraCapture"><i class="bi bi-camera-fill me-1"></i>Take Photo</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function openCamera(onCaptured) {
    const modal=ensureModal();
    const video=modal.querySelector('#fcmsCameraVideo');
    const canvas=modal.querySelector('#fcmsCameraCanvas');
    const status=modal.querySelector('#fcmsCameraStatus');
    let stream=null;
    let closed=false;
    const close=()=>{
      if (closed) return;
      closed=true;
      if(stream) stream.getTracks().forEach(t=>t.stop());
      video.srcObject=null;
      modal.classList.remove('show');
      document.body.classList.remove('fcms-camera-open');
    };
    modal.querySelector('.fcms-camera-close').onclick=close;
    modal.querySelector('#fcmsCameraCancel').onclick=close;
    modal.querySelector('.fcms-camera-backdrop').onclick=close;
    modal.querySelector('#fcmsCameraCapture').onclick=async()=>{
      if(!stream) return;
      const max=1600;
      const scale=Math.min(1,max/Math.max(video.videoWidth,video.videoHeight));
      canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
      canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
      canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
      const dataUrl=canvas.toDataURL('image/jpeg',.72);
      close();
      onCaptured({dataUrl,name:`receipt-${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`,file:dataUrlToFile(dataUrl)});
    };
    modal.classList.add('show');
    document.body.classList.add('fcms-camera-open');
    status.textContent='Starting camera…';
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      status.textContent='Camera is not available in this browser. Use Choose File instead.';
      return;
    }
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false})
      .then(s=>{stream=s;video.srcObject=s;status.textContent='Position the receipt inside the frame.';})
      .catch(()=>{status.textContent='Camera access was blocked. Allow camera permission or use Choose File instead.';});
  }

  async function processFile(file) {
    if(!file) return null;
    if(!/^image\/(jpeg|png|webp)$/i.test(file.type)) return {error:'Please choose an image (JPG, PNG, or WebP).'};
    if(file.size>8*1024*1024) return {error:'Image must be under 8MB.'};
    try{
      const raw=await fileToDataUrl(file);
      const dataUrl=await resizeImage(raw);
      return {dataUrl,name:file.name||'receipt-image.jpg',file};
    }catch(e){ return {error:'Could not read that image. Please try again.'}; }
  }

  window.FCMSReceiptCamera={open:openCamera,processFile,resizeImage,fileToDataUrl};
})();
