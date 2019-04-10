/**
 * *******************************************************
 * Config default
 * *******************************************************
 */

let options = {
    selector: 'input[type="file"]',
    maxFileSize: 2,
    maxTotalFilesSize: 10,
    maxNbFiles: 5,
    limitCharacters: 10,
    displayRestSize: true,
    displayRestFiles: true,
    displayFilenameError: true,
    multiple: true,
    mimeType: false,
    fileExtensions: [".jpg", ".jpeg", ".png", ".pdf"],
    dropZone: true,
    actionAjax: null,
    language: 'fr',
    textBtnUpload: {
        'fr': 'Ajouter un fichier',
        'en': 'Add a file'
    },
    textBeforeUpload: {
        'fr': 'Aucun fichier sélectionné',
        'en': 'No file selected'
    },
    textAfterUpload:{
        'fr': 'Vos fichiers',
        'en': 'Your files'
    },
    textRest:{
        'fr': "restants",
        'en': 'left'
    },
    textFile:{
        'fr': 'fichiers',
        'en': 'files'
    },
    textFileNotValid:{
        'fr': "Votre fichier n'est pas valide:",
        'en': 'Your file is not valid'
    },
    textMultipleFileNotValid: {
        'fr': "Vos fichiers ne sont pas valides:",
        'en': 'Your file are not valid:'
    },
    textFileTooBig:{
        'fr': "Votre fichier est trop lourd:",
        'en': 'Your file is too big'
    },
    textMultipleFileTooBig:{
        'fr': "Vos fichiers sont trop lourd:",
        'en': 'Your file is too big'
    },
    textTotalFilesSize:{
        'fr': "Le poids total de vos fichiers est trop lourd !",
        'en': 'Too many files !'
    },
    textTooManyFiles:{
        'fr': "Trop de fichiers téléchargés !",
        'en': 'Too many files uploaded'
    },
    textTotalFiles:{
        'fr': "La limite du nombre de fichier est atteinte",
        'en': 'The limit has been reached'
    },
    textErrorUpload:{
        'fr': "Une erreur est survenue, impossible de télécharger le fichier !",
        'en': 'Cannot upload the file'
    },
    onSuccess: () => {},
    onError: () => {},
    onDelete: () => {}
}


/**
 * *******************************************************
 * Global variables
 * *******************************************************
 */

let currentFiles = [];
let filesList = [];
let currentErrors = [];
let maxTotalFilesSize;
let wrapperFiles;
let parentInput;
let wrapperInput;
let wrapperInformation;
let filesContent;
let fileInput;
let wrapperBtnUpload;
let btnUpload;
let wrapperSelected;
let wrapperError;
let restSize;
let restFiles;
let progressBar;
let progressBarContent;


/**
 * *******************************************************
 * Initializing
 * *******************************************************
 */

const init = settings => {

    options = Object.assign(options, settings);

    maxTotalFilesSize = options.maxTotalFilesSize * 1048576;

    fileInput  = document.querySelector(options.selector);

    if(!fileInput){
        return;
    }

    parentInput = fileInput.parentNode;

    wrapperInput = document.createElement('div');
    wrapperInput.classList.add('w-input');

    wrapperBtnUpload = document.createElement('div');
    wrapperBtnUpload.classList.add('w-input__upload');

    btnUpload = document.createElement('span');
    btnUpload.innerHTML = options.textBtnUpload[options.language];

    parentInput.replaceChild(wrapperInput, fileInput);
    wrapperInput.appendChild(fileInput);
    wrapperInput.appendChild(wrapperBtnUpload);
    wrapperBtnUpload.appendChild(btnUpload);

    if(options.displayRestSize || options.displayRestFiles){

        wrapperInformation = document.createElement('div');
        wrapperInformation.classList.add('w-information');
        parentInput.appendChild(wrapperInformation);

        if(options.displayRestSize){
            restSize = document.createElement('div');
            restSize.classList.add('w-information__size');
            restSize.innerHTML = getRestSize() +' '+ options.textRest[options.language];
            wrapperInformation.appendChild(restSize);
        }

        if(options.displayRestFiles){
            restFiles = document.createElement('div');
            restFiles.classList.add('w-information__files');
            restFiles.innerHTML = options.maxNbFiles +' '+ options.textFile[options.language] +' '+ options.textRest[options.language];
            wrapperInformation.appendChild(restFiles);
        }

    }

    wrapperFiles = document.createElement('div');
    wrapperFiles.classList.add('w-files');
    parentInput.appendChild(wrapperFiles);

    wrapperSelected = document.createElement('span');
    wrapperSelected.classList.add('w-files__selected');
    wrapperSelected.innerHTML = options.textBeforeUpload[options.language];
    wrapperFiles.appendChild(wrapperSelected);

    if(options.actionAjax){
        progressBar = document.createElement('div');
        progressBar.classList.add('w-progress-bar');

        progressBarContent = document.createElement('div');
        progressBarContent.classList.add('w-progress-bar__content');

        progressBar.appendChild(progressBarContent);
        parentInput.appendChild(progressBar);
    }

    if(options.multiple){
        fileInput.setAttribute('multiple', true);
    }

    if(options.fileExtensions.length){
        fileInput.setAttribute('accept', options.fileExtensions);
    }

    fileInput.addEventListener("change", addNewFile);

    if (options.dropZone) {
        initDropZone();
    }
}

/**
 * *******************************************************
 * Drop Zone
 * *******************************************************
 */
const initDropZone = () => {
    let droppedFiles = false;

    wrapperBtnUpload.addEventListener('dragover', function() {
        event.preventDefault(); // prevent default to allow drop
        parentInput.classList.add('is-dragover');
    }, false);

    wrapperBtnUpload.addEventListener('dragenter', function() {
        parentInput.classList.add('is-dragover');
    }, false);

    wrapperBtnUpload.addEventListener('dragleave', function() {
        parentInput.classList.remove('is-dragover');
    }, false);

    wrapperBtnUpload.addEventListener('dragend', function() {
        parentInput.classList.remove('is-dragover');
    }, false);

    wrapperBtnUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        parentInput.classList.remove('is-dragover');
        droppedFiles = e.dataTransfer.files;
        addNewFile(e, droppedFiles);
    }, false);

    wrapperBtnUpload.addEventListener('click', function() {
        fileInput.click();
    }, false);
};


/**
 * *******************************************************
 * Add a new file in array
 * *******************************************************
 */
const addNewFile = (event, files=[]) => {

    currentFiles = [];
    currentErrors = [];

    let filesArr = files.length ? files : event.target.files ? event.target.files : null;

    if(!filesArr){
        return;
    }

    if(options.maxNbFiles && options.maxNbFiles < filesArr.length){
        currentErrors.push({
            error: new Error("Limit files !").code = "TOO_MANY_FILES",
            message: options.textTooManyFiles[options.language]
        });
        displayError();
        return;
    }

    if(options.maxNbFiles && options.maxNbFiles === filesList.length){
        currentErrors.push({
            error: new Error("Limit files !").code = "TOO_MANY_FILES",
            message: options.textTotalFiles[options.language]
        });
        displayError();
        return;
    }

    Object.values(filesArr).forEach((file, i) => {

        const extension = file.name.split('.').length > 1 ? '.'+ file.name.split('.').pop().toLowerCase() : null;

        if(options.fileExtensions.length && options.fileExtensions.indexOf(extension) === -1){
            currentErrors.push({
                error: new Error("Extension is not valid").code = "EXTENSION",
                mimeType: extension,
                file: file,
                message: options.textFileNotValid[options.language]
            });
            return;
        }

        if(!validSize(file)){
            currentErrors.push({
                error: new Error("Size is too big").code = "SIZE",
                file: file,
                fileSize: getFileSize(file.size),
                message: options.textFileTooBig[options.language]
            });
            return;
        }

        if(!validTotalSize(file)){
            currentErrors.push({
                error: new Error("Total size is too big").code = "TOTAL_SIZE",
                file: file,
                fileSize: getFileSize(file.size),
                restSize: getRestSize(),
                message: options.textTotalFilesSize[options.language]
            });
            return;
        }

        currentFiles.push(file);

    });

    if(options.mimeType && filesArr.length === currentErrors.length){
        displayError();
    }

    if(options.mimeType){

        let index = parseInt(1 + currentErrors.length);

        currentFiles.forEach((file, i) => {

            getFormat(escape(file.name), file, (url, headerString) => {

                const mimeType = getMimeType(headerString);

                if(options.fileExtensions.length && !isValidMimeType(mimeType)){
                    currentErrors.push({
                        error: new Error("Mime Type is not valid").code = "EXTENSION",
                        mimeType: getExtension(file.name),
                        file: file,
                        message: options.textFileNotValid[options.language]
                    });
                    currentFiles.splice(currentFiles.findIndex(x => x.name === file.name), 1);
                }

                if(filesArr.length === index){
                    checkFiles();
                }

                index++;

            });
        });

        return;
    }

    checkFiles();

}


/**
 * *******************************************************
 * Check file
 * *******************************************************
 */
const checkFiles = () => {

    if(!validTotalSize(null, currentFiles)){
        currentErrors.push({
            error: new Error("Total size is too big").code = "TOTAL_SIZE_MULTIPLE",
            currentFiles: currentFiles,
            restSize: getRestSize(),
            message: options.textTotalFilesSize[options.language]
        });
        displayError();
        return;
    }

    if(currentFiles.length){
        onSuccess(currentFiles);
    }

    if(currentErrors.length){
        displayError();
    }

};


/**
 * *******************************************************
 * On success
 * *******************************************************
 */
const onSuccess = (file, nbFile) => {

    if(!currentErrors.length){
        cleanError();
    }

    if(options.actionAjax){
        uploadFile(currentFiles);
    }
    else{
        displayResult(currentFiles);
    }

}


/**
 * *******************************************************
 * Display result
 * *******************************************************
 */
 const displayResult = (currentFiles) => {

    filesList = filesList.concat(currentFiles);

    displayFile();

    options.onSuccess({
        currentFiles: currentFiles,
        files: filesList,
        errors: currentErrors
    });

}


/**
 * *******************************************************
 * Upload file
 * *******************************************************
 */
const uploadFile = (currentFiles) => {

    if(progressBar){
        parentInput.classList.add('uploading');
        progressBar.classList.add('active');
        progressBarContent.style.width = '0%';
    }
    else{
        return;
    }

    const fd = new FormData();

    for (let i = 0; i < currentFiles.length; i++) {
        fd.append(fileInput.getAttribute("name") + '[' + i + ']', currentFiles[i]);
    }

    const xhr = new XMLHttpRequest();

    xhr.open("POST", options.actionAjax);

    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.upload.addEventListener("progress", function(evt) {

        if (evt.lengthComputable) {

            let percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);
            progressBarContent.style.width = percentComplete + '%';

            if(percentComplete === 100){
                setTimeout(() => {
                    parentInput.classList.remove('uploading');
                    progressBar.classList.remove('active');
                }, 500);
            }

        }

    });

    xhr.onreadystatechange = function(data) {

        if (xhr.readyState === 4) {
            if (xhr.status === 200){
                displayResult(currentFiles);
            }
            else {

                progressBarContent.style.width = '0%';

                currentErrors.push({
                    error: new Error("Cannot upload file").code = "UPLOAD",
                    currentFiles: currentFiles,
                    message: options.textErrorUpload[options.language]
                });

                displayError();

            }
        }

    };

    xhr.send(fd);
}



/**
 * *******************************************************
 * Display files list
 * *******************************************************
 */
const displayFile = () => {

    if(!filesContent){
        filesContent = document.createElement('div');
        filesContent.classList.add('w-files__content');
        wrapperFiles.appendChild(filesContent);
    }
    else{
        filesContent.innerHTML = '';
    }

    if(filesList.length){
        wrapperSelected.innerHTML = options.textAfterUpload[options.language];
    }
    else{
        wrapperSelected.innerHTML = options.textBeforeUpload[options.language];
    }

    if(restSize){
        restSize.innerHTML = getRestSize() +' '+ options.textRest[options.language];
    }

    if(restFiles){
        restFiles.innerHTML = (options.maxNbFiles - filesList.length) +' '+ options.textFile[options.language] +' '+ options.textRest[options.language];
    }

    filesList.forEach((file) => {
        let newFile = document.createElement('div');
        newFile.classList.add('file');
        newFile.innerHTML =
        '<span class="file__delete"></span>'+
        '<span class="file__name">'+ getFileName(file.name) +'</span>'+
        '<span class="file__size">('+ getFileSize(file.size) +')</span>';
        filesContent.appendChild(newFile);
        newFile.querySelector('.file__delete').addEventListener("click", removeFile);
    });
};


/**
 * *******************************************************
 * Remove file from array
 * *******************************************************
 */
const removeFile = (e) => {
    const nodes = Array.prototype.slice.call( filesContent.children );
    const index = nodes.indexOf(e.target.parentNode);
    const file = filesList[index];
    filesList.splice(index, 1);
    displayFile();
    options.onDelete({
        file,
        filesList
    });
};


/**
 * *******************************************************
 * Clean error
 * *******************************************************
 */
const cleanError = () => {
    parentInput.classList.remove('error-upload');
    if(wrapperError && wrapperError.parentNode){
        wrapperError.parentNode.removeChild(wrapperError);
    }
};


/**
 * *******************************************************
 * Get format
 * *******************************************************
 */
const getFormat = (url, blob, callback) => {
    var fileReader = new FileReader();
    parentInput.classList.add('loading');
    fileReader.onloadend = function(e) {
      var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
      var header = "";
      for (var i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      parentInput.classList.remove('loading');
      callback(url, header);
    };
    fileReader.readAsArrayBuffer(blob);
}


/**
 * *******************************************************
 * Get extension
 * *******************************************************
 */
const getExtension = (filename) => {
    return filename.split('.').length > 1 ? '.'+ filename.split('.').pop().toLowerCase() : null;
};


/**
 * *******************************************************
 * Get mime type
 * *******************************************************
 */
const getMimeType = (headerString) => {
    switch (headerString) {
        case "89504e47":
            type = ".png";
            break;
        case "47494638":
            type = ".gif";
            break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
            type = ".jpeg";
            break;
        case "ffd8ffdb":
        case "ffd8ffee":
            type = ".jpg";
            break;
        case "41647265":
            type = ".txt";
            break;
        case "25504446":
            type = ".pdf";
            break;
        case "504b34":
        case "504b0304":
            type = [".zip", ".xlsx", ".pptx", '.docx'];
            break;
        default:
            type = "unknown";
            break;
    }
    return type;
}


/**
 * *******************************************************
 * Return if Mime Type is correct
 * *******************************************************
 */
 const isValidMimeType = (mimeType) => {
    if(Array.isArray(mimeType)){
        for(let i = 0; i <= mimeType.length; i++){
            if(options.fileExtensions.indexOf(mimeType[i]) !== -1){
                return true;
            }
        }
        return false;
    }
    else{
        if(options.fileExtensions.indexOf(mimeType) !== -1){
            return true;
        }
        return false;
    }
};


/**
 * *******************************************************
 * Check if size is valid
 * *******************************************************
 */
const validSize = (file) => {
    let fileSize = file.size / 1024 / 1024;
    if (fileSize < options.maxFileSize) {
        return true;
    }
    return false;
};


/**
 * *******************************************************
 * Check if total size is valid
 * *******************************************************
 */
const validTotalSize = (file=null, files=filesList) => {
    return Math.round(maxTotalFilesSize) >= getTotalSize(file, files);
};


/**
 * *******************************************************
 * Return size rest
 * *******************************************************
 */
const getRestSize = (files=filesList) => {
    return getFileSize(maxTotalFilesSize - getTotalSize(null, files));
};


/**
 * *******************************************************
 * Return files list
 * *******************************************************
 */
const getFiles = () => {
    return filesList;
};


/**
 * *******************************************************
 * Return total size of files list
 * *******************************************************
 */
const getTotalSize = (file, files) => {
    let size = 0;
    if(files.length){
        for(let i in files) {
            size += files[i].size;
        }
    }
    if(file){
        size += file.size;
    }
    return size;
};


/**
 * *******************************************************
 * Return file size
 * *******************************************************
 */
const getFileSize = (size) => {
    let fSExt = new Array('Octets', 'Ko', 'Mo', 'Go');
    let i = 0;
    while(size > 900){
        size /= 1024;
        i++;
    }
    return (Math.round(size*100)/100)+' '+fSExt[i];
};


/**
 * *******************************************************
 * Return filename
 * *******************************************************
 */
const getFileName = (filename) => {
    let ext = filename.split('.').pop();
    let length = filename.length - ext.length - 1;
    if(length > options.limitCharacters){
        filename = filename.substr(0, options.limitCharacters) + '(...).' + ext;
    }
    return filename;
};


/**
 * *******************************************************
 * Return form data
 * *******************************************************
 */
 const getFormData = (form) => {
    let formData = new FormData(form[0]);
    for (let i = 0; i < filesList.length; i++) {
        formData.append(fileInput.getAttribute("name") + '[' + i + ']', filesList[i]);
    }
    return formData;
};


/**
 * *******************************************************
 * Update
 * *******************************************************
 */
const update = settings => {

    if(!Object.keys(settings).length){
        return;
    }

    if(Object.keys(settings).length === 1 && settings.language){

        options.language = settings.language;

        cleanError();

        if(filesList.length){
            wrapperSelected.innerHTML = options.textAfterUpload[options.language];
        }
        else{
            wrapperSelected.innerHTML = options.textBeforeUpload[options.language];
        }

        if(options.displayRest){
            rest.innerHTML = getRestSize() +' '+ options.textRest[options.language];
        }

    }
    else{
        reset(settings);
    }

}

/**
 * *******************************************************
 * Reset
 * *******************************************************
 */
 const reset = (settings={}) => {

    if(wrapperInformation){

        cleanError();

        filesList = [];

        wrapperInformation.remove();

        if(wrapperFiles){
            wrapperFiles.remove();
        }

    }

    init(settings);

}


/**
 * *******************************************************
 * Clear
 * *******************************************************
 */
const clear = () => {
    if(wrapperInformation){
        filesList = [];
        cleanError();
        displayFile();
    }
};


/**
 * *******************************************************
 * Display Errors
 * *******************************************************
 */
const displayError = () => {

    if(wrapperInformation){

        cleanError();

        wrapperError = document.createElement('div');
        wrapperError.classList.add('w-information__error');

        const errorSize = currentErrors.filter(x => x.error === 'SIZE');

        if(errorSize.length){
            let error = document.createElement('span');
            let text = errorSize.length === 1 ? options.textFileTooBig[options.language] : options.textMultipleFileTooBig[options.language];

            if(options.displayFilenameError){
                errorSize.forEach((currentError, i) => {
                    text += i ? ', ' + getFileName(currentError.file.name) : ' ' + getFileName(currentError.file.name);
                });
            }

            error.innerHTML = text;
            wrapperError.appendChild(error);
        }

        const errorExtension = currentErrors.filter(x => x.error === 'EXTENSION');

        if(errorExtension.length){
            let error = document.createElement('span');
            let text = errorExtension.length === 1 ? options.textFileNotValid[options.language] : options.textMultipleFileNotValid[options.language];

            if(options.displayFilenameError){
                errorExtension.forEach((currentError, i) => {
                    text += i ? ', ' + getFileName(currentError.file.name) : ' ' + getFileName(currentError.file.name);
                });
            }

            error.innerHTML = text;
            wrapperError.appendChild(error);
        }

        currentErrors.forEach((currentError) => {
            if(currentError.error !== 'EXTENSION' && currentError.error !== 'SIZE'){
                let error = document.createElement('span');
                error.innerHTML = currentError.message;
                wrapperError.appendChild(error);
            }
        });

        wrapperInformation.appendChild(wrapperError);

        parentInput.classList.add('error-upload');
    }

    options.onError({
        errors: currentErrors
    });

};




/**
 * Export functions
 */
export default {
    init,
    update,
    reset,
    clear,
    getFormData,
    getFiles
};
