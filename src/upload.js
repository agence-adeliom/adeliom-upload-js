/**
 * *******************************************************
 * Polyfill for IE
 * *******************************************************
 */
//import 'babel-polyfill';


/**
 * *******************************************************
 * Config default
 * *******************************************************
 */

let options = {
    selector: 'input[type="file"]',
    maxFileSize: 2, // in Mb
    maxTotalFilesSize: 10, // in Mb
    displayRest: false, // to see how many Mb you can still upload
    multiple: true,
    mimeType: true, // test the mime type
    fileExtensions: [".jpg", ".jpeg", ".png", ".pdf", ".xlsx"], // an array is required
    filesList: [],
    dropZone: false,
    language: 'fr',
    textBeforeUpload: {
        'fr': 'Aucun fichier sélectionné',
        'en': 'No file selected',
    },
    textAfterUpload:{
        'fr': 'Vos fichiers',
        'en': 'Your files',
    },
    textFileNotValid:{
        'fr': "Votre fichier n'est pas valide !",
        'en': 'Your file is not valid',
    },
    textFileTooBig:{
        'fr': "Votre fichier est trop lourd !",
        'en': 'Your file is too big',
    },
    textTooManyFiles:{
        'fr': "Le poids total de vos fichiers est trop lourd !",
        'en': 'Too many files !',
    },
    textRest:{
        'fr': "restants",
        'en': 'left',
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

let filesList = [];
let maxTotalFilesSize;
let wrapperInformation;
let wrapperFiles;
let wrapperInput;
let fileInput;
let labelInput;
let text;
let error;
let rest;


/**
 * *******************************************************
 * Initializing
 * *******************************************************
 */

export const init = settings => {

    options = Object.assign(options, settings);

    maxTotalFilesSize = options.maxTotalFilesSize * 1048576;

    fileInput  = document.querySelector(options.selector);

    if(!fileInput){
        return;
    }

    wrapperInput = fileInput.parentNode;

    labelInput = wrapperInput.querySelector('label');

    wrapperInformation = document.createElement('div');
    wrapperInformation.classList.add('w-information');
    wrapperInput.appendChild(wrapperInformation);

    text = document.createElement('span');
    text.classList.add('w-information__selected')
    text.innerHTML = options.textBeforeUpload[options.language];
    wrapperInformation.appendChild(text);

    if(options.displayRest){
        rest = document.createElement('span');
        rest.classList.add('w-information__rest')
        rest.innerHTML = getRestSize() +' '+ options.textRest[options.language];
        wrapperInformation.appendChild(rest);
    }

    error = document.createElement('span');
    error.classList.add('w-information__error');

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

    if(settings.filesList.length){
        addNewFile(null, filesList);
    }
}

/**
 * *******************************************************
 * Drop Zone
 * *******************************************************
 */
const initDropZone = () => {
    let droppedFiles = false;

    labelInput.addEventListener('dragover', function() {
        event.preventDefault(); // prevent default to allow drop
        wrapperInput.classList.add('is-dragover');
    }, false);

    labelInput.addEventListener('dragenter', function() {
        wrapperInput.classList.add('is-dragover');
    }, false);

    labelInput.addEventListener('dragleave', function() {
        wrapperInput.classList.remove('is-dragover');
    }, false);

    labelInput.addEventListener('dragend', function() {
        wrapperInput.classList.remove('is-dragover');
    }, false);

    labelInput.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        wrapperInput.classList.remove('is-dragover');
        droppedFiles = e.dataTransfer.files;
        addNewFile(e, droppedFiles);
    }, false);
};


/**
 * *******************************************************
 * Add a new file in array
 * *******************************************************
 */
const addNewFile = (event, files=[]) => {

    let filesArr = files.length ? files : event.target.files ? event.target.files : null;

    if(!filesArr){
        return;
    }

    Object.values(filesArr).forEach((file) => {

        const extension = file.name.split('.').length > 1 ? '.'+ file.name.split('.').pop().toLowerCase() : null;

        if(options.fileExtensions.length && options.fileExtensions.indexOf(extension) === -1){
            options.onError({
                error: new Error("Extension is not valid").code = "EXTENSION",
                mimeType: extension,
                file: file,
                drop: files.length ? true : false
            });
            addError(options.textFileNotValid[options.language]);
            return;
        }

        if(!validSize(file)){
            options.onError({
                error: new Error("Size is too big").code = "SIZE",
                file: file,
                fileSize: getFileSize(file.size)
            });
            addError(options.textFileTooBig[options.language]);
            return;
        }

        if(!validTotalSize(file)){
            options.onError({
                error: new Error("Total size is too big").code = "TOTAL_SIZE",
                file: file,
                fileSize: getFileSize(file.size),
                totalSize: getRestSize()
            });
            addError(options.textTooManyFiles[options.language]);
            return;
        }

        if(options.mimeType){
            getFormat(escape(file.name), file, (url, headerString) => {

                const mimeType = getMimeType(headerString);

                if(options.fileExtensions.length && !isValidMimeType(mimeType)){
                    options.onError({
                        error: new Error("Mime Type is not valid").code = "MIME_TYPE",
                        mimeType: extension,
                        file: file
                    });
                    addError(options.textFileNotValid[options.language]);
                    return;
                }

                onSuccess(file);

            });
            return;
        }

        onSuccess(file);

    });

}


/**
 * *******************************************************
 * On success
 * *******************************************************
 */
const onSuccess = (file) => {
    cleanError();
    filesList.push(file);
    displayFile();
    options.onSuccess({
        file: file,
        filesList: filesList
    });
}


/**
 * *******************************************************
 * Display files list
 * *******************************************************
 */
const displayFile = () => {
    if(!wrapperFiles){
        wrapperFiles = document.createElement('div');
        wrapperFiles.classList.add('w-files');
        wrapperInput.appendChild(wrapperFiles);
    }
    else{
        wrapperFiles.innerHTML = '';
    }

    if(filesList.length){
        text.innerHTML = options.textAfterUpload[options.language];
    }
    else{
        text.innerHTML = options.textBeforeUpload[options.language];
    }

    if(rest){
        rest.innerHTML = getRestSize() +' '+ options.textRest[options.language];
    }

    filesList.forEach((file) => {
        let newFile = document.createElement('div');
        newFile.classList.add('file');
        newFile.innerHTML =
        '<span class="file__delete">Delete</span>'+
        '<span class="file__name">'+ file.name +'</span>'+
        '<span class="file__size">('+ getFileSize(file.size) +')</span>';
        wrapperFiles.appendChild(newFile);
        newFile.querySelector('.file__delete').addEventListener("click", removeFile);
    });
};


/**
 * *******************************************************
 * Remove file from array
 * *******************************************************
 */
const removeFile = (e) => {
    const nodes = Array.prototype.slice.call( wrapperFiles.children );
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
    wrapperInput.classList.remove('error-upload');
    error.innerHTML = '';
};


/**
 * *******************************************************
 * Get format
 * *******************************************************
 */
const getFormat = (url, blob, callback) => {
    var fileReader = new FileReader();
    wrapperInput.classList.add('loading');
    fileReader.onloadend = function(e) {
      var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
      var header = "";
      for (var i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      wrapperInput.classList.remove('loading');
      callback(url, header);
    };
    fileReader.readAsArrayBuffer(blob);
};


/**
 * *******************************************************
 * Get mime type
 * *******************************************************
 */
const getMimeType = (headerString) => {
    let type;
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
};


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
const validTotalSize = (file='') => {
    return Math.round(maxTotalFilesSize) >= getTotalSize(file);
};


/**
 * *******************************************************
 * Return size rest
 * *******************************************************
 */
const getRestSize = () => {
    return getFileSize(maxTotalFilesSize - getTotalSize());
};


/**
 * *******************************************************
 * Return total size of files list
 * *******************************************************
 */
const getTotalSize = (file) => {
    let size = 0;
    if(filesList.length){
        for(let i in filesList) {
            size += filesList[i].size;
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
 * Return files list
 * *******************************************************
 */
const getFiles = () => {
    return filesList;
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
            text.innerHTML = options.textAfterUpload[options.language];
        }
        else{
            text.innerHTML = options.textBeforeUpload[options.language];
        }

        if(options.displayRest){
            rest.innerHTML = getRestSize() +' '+ options.textRest[options.language];
        }

    }
    else{
        reset(settings);
    }

};


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

};


/**
 * *******************************************************
 * Clear
 * *******************************************************
 */
const clear = () => {

    if(wrapperInformation){

        cleanError();

        filesList = [];

        displayFile();

    }

};


/**
 * *******************************************************
 * Add Error
 * *******************************************************
 */
const addError = (message) => {

    if(wrapperInformation){

        cleanError();

        error.innerHTML = message;
        wrapperInformation.insertBefore(error, text);
        wrapperInput.classList.add('error-upload');

    }

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
