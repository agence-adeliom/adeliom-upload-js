import {fr} from './languages/fr.js';
import {en} from './languages/en.js';

class Emitter {

    constructor() {
        this.events = {};
    }

    on(eventName, fn) {
        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(fn);
    }

    emit(eventName, data) {
        const event = this.events[eventName];
        if(event) {
            event.forEach(fn => {
                fn.call(null, data);
            });
        }
    }

}


export default class Upload extends Emitter {

    constructor(settings){

        super();

        /**
         * *******************************************************
         * Config default
         * *******************************************************
         */

        this.options = {
            selector: 'input[type="file"]',
            maxFileSize: 2,
            maxTotalFilesSize: 10,
            maxNbFiles: 5,
            limitCharacters: 10,
            displayMaxFileSize: true,
            displayRestSize: true,
            displayRestFiles: true,
            displayFilenameError: true,
            multiple: true,
            mimeType: false,
            fileExtensions: [".jpg", ".jpeg", ".png", ".pdf"],
            dropZone: false,
            actionAjax: null,
            language: 'fr',
            languages: {},
            customContentOnly: false,
            customContent: ''
        }

        this.text = [];

        this.text.fr = fr;
        this.text.en = en;


        /**
         * *******************************************************
         * Merge object
         * *******************************************************
         */
        this.options = this._mergeObjects(this.options, settings);


        /**
         * *******************************************************
         * Merge languages
         * *******************************************************
         */
        const keysLng = Object.keys(this.options.languages);

        if(keysLng.length){
            keysLng.forEach((lng, i) => {
                if(!this.text[lng]){
                    if(this._compareKeys(this.options.languages[lng], fr)){
                        this.text[lng] = this.options.languages[lng];
                    }
                }
                else{
                    this._mergeObjects(this.text[lng], this.options.languages[lng]);
                }
            });
        }


        /**
         * *******************************************************
         * Global variables
         * *******************************************************
         */
        this.currentFiles = [];
        this.filesList = [];
        this.currentErrors = [];
        this.maxTotalFilesSize;
        this.wrapperFiles;
        this.parentInput;
        this.wrapperInput;
        this.wrapperInformation;
        this.filesContent;
        this.fileInput;
        this.wrapperBtnUpload;
        this.btnUpload;
        this.wrapperSelected;
        this.wrapperError;
        this.maxFileSize;
        this.restSize;
        this.restFiles;
        this.progressBar;
        this.progressBarContent;

    }


    /**
     * *******************************************************
     * Initializing
     * *******************************************************
     */

    init(){

        this.maxTotalFilesSize = this.options.maxTotalFilesSize * 1048576;

        this.fileInput  = document.querySelector(this.options.selector);

        if(!this.fileInput){
            return;
        }

        this.parentInput = this.fileInput.parentNode;

        this.wrapperInput = document.createElement('div');
        this.wrapperInput.classList.add('w-input');

        this.wrapperBtnUpload = document.createElement('div');
        this.wrapperBtnUpload.classList.add('w-input__upload');

        this.btnUpload = document.createElement('span');
        this.btnUpload.innerHTML = this.text[this.options.language].textBtnUpload;

        this.parentInput.replaceChild(this.wrapperInput, this.fileInput);
        this.wrapperInput.appendChild(this.fileInput);

        this.wrapperInput.appendChild(this.wrapperBtnUpload);

        if(!this.options.customContent || !this.options.customContentOnly){
            this.wrapperBtnUpload.appendChild(this.btnUpload);
        }

        if(this.options.customContent){
            const customContent = new DOMParser().parseFromString(this.options.customContent, "text/xml");
            this.wrapperBtnUpload.appendChild(customContent.firstChild);
        }

        if(this.options.displayRestSize || this.options.displayRestFiles || this.options.displayMaxFileSize){

            this.wrapperInformation = document.createElement('div');
            this.wrapperInformation.classList.add('w-information');
            this.parentInput.appendChild(this.wrapperInformation);

            if(this.options.displayRestSize){
                this.restSize = document.createElement('div');
                this.restSize.classList.add('w-information__size');
                this.restSize.innerHTML = this._getText(this.text[this.options.language].textSizeRest, this._getRestSize());
                this.wrapperInformation.appendChild(this.restSize);
            }

            if(this.options.displayMaxFileSize){
                this.maxFileSize = document.createElement('div');
                this.maxFileSize.classList.add('w-information__size-max');
                this.maxFileSize.innerHTML = this._getText(this.text[this.options.language].textMaxFileSize, this._getFileSize(this.options.maxFileSize * 1048576));
                this.wrapperInformation.appendChild(this.maxFileSize);
            }

            if(this.options.displayRestFiles){
                this.restFiles = document.createElement('div');
                this.restFiles.classList.add('w-information__files');
                this.restFiles.innerHTML = this._getText(this.text[this.options.language].textFileRest, this.options.maxNbFiles);
                this.wrapperInformation.appendChild(this.restFiles);
            }

        }

        this.wrapperFiles = document.createElement('div');
        this.wrapperFiles.classList.add('w-files');
        this.parentInput.appendChild(this.wrapperFiles);

        this.wrapperSelected = document.createElement('span');
        this.wrapperSelected.classList.add('w-files__selected');
        this.wrapperSelected.innerHTML = this.text[this.options.language].textBeforeUpload;
        this.wrapperFiles.appendChild(this.wrapperSelected);

        if(this.options.actionAjax){
            this.progressBar = document.createElement('div');
            this.progressBar.classList.add('w-progress-bar');

            this.progressBarContent = document.createElement('div');
            this.progressBarContent.classList.add('w-progress-bar__content');

            this.progressBar.appendChild(this.progressBarContent);
            this.parentInput.appendChild(this.progressBar);
        }

        if(this.options.multiple){
            this.fileInput.setAttribute('multiple', true);
        }

        if(this.options.fileExtensions.length){
            this.fileInput.setAttribute('accept', this.options.fileExtensions);
        }

        this.fileInput.addEventListener("change", this._addNewFile.bind(this));

        this.wrapperBtnUpload.addEventListener('click', () => {
            this.fileInput.click();
        }, false);

        if (this.options.dropZone) {
            this._initDropZone();
            return;
        }

        this.emit("init", {
            init: true
        });

    }

    /**
     * *******************************************************
     * Drop Zone
     * *******************************************************
     */
    _initDropZone(){

        let droppedFiles = false;

        this.wrapperBtnUpload.addEventListener('dragover', () => {
            event.preventDefault(); // prevent default to allow drop
            this.parentInput.classList.add('is-dragover');
        }, false);

        this.wrapperBtnUpload.addEventListener('dragenter', () => {
            this.parentInput.classList.add('is-dragover');
        }, false);

        this.wrapperBtnUpload.addEventListener('dragleave', () => {
            this.parentInput.classList.remove('is-dragover');
        }, false);

        this.wrapperBtnUpload.addEventListener('dragend', () => {
            this.parentInput.classList.remove('is-dragover');
        }, false);

        this.wrapperBtnUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.parentInput.classList.remove('is-dragover');
            droppedFiles = e.dataTransfer.files;
            this._addNewFile(e, droppedFiles);
        }, false);

        this.emit("init", {
            init: true,
            initDropZone: true
        });

    };


    /**
     * *******************************************************
     * Add a new file in array
     * *******************************************************
     */
    _addNewFile(event, files=[]){

        this.currentFiles = [];
        this.currentErrors = [];

        let filesArr = files.length ? files : event.target.files ? event.target.files : null;

        if(!filesArr){
            return;
        }

        if(this.options.maxNbFiles && this.options.maxNbFiles < filesArr.length){
            this.currentErrors.push({
                error: new Error("Limit files !").code = "TOO_MANY_FILES",
                message: this.text[this.options.language].textTooManyFiles
            });
            this._displayError();
            return;
        }

        if(this.options.maxNbFiles && (this.options.maxNbFiles === this.filesList.length) || (this.options.maxNbFiles < this.filesList.length + filesArr.length)){
            this.currentErrors.push({
                error: new Error("Limit files !").code = "TOO_MANY_FILES",
                message: this.text[this.options.language].textTotalFiles
            });
            this._displayError();
            return;
        }

        Object.values(filesArr).forEach((file, i) => {

            const extension = file.name.split('.').length > 1 ? '.'+ file.name.split('.').pop().toLowerCase() : null;

            if(this.options.fileExtensions.length && this.options.fileExtensions.indexOf(extension) === -1){
                this.currentErrors.push({
                    error: new Error("Extension is not valid").code = "EXTENSION",
                    mimeType: extension,
                    file: file,
                    message: this.text[this.options.language].textFileNotValid
                });
                return;
            }

            if(!this._validSize(file)){
                this.currentErrors.push({
                    error: new Error("Size is too big").code = "SIZE",
                    file: file,
                    fileSize: this._getFileSize(file.size),
                    message: this.text[this.options.language].textFileTooBig
                });
                return;
            }

            if(!this._validTotalSize(file)){
                this.currentErrors.push({
                    error: new Error("Total size is too big").code = "TOTAL_SIZE",
                    file: file,
                    fileSize: this._getFileSize(file.size),
                    restSize: this._getRestSize(),
                    message: this.text[this.options.language].textTotalFilesSize
                });
                return;
            }

            this.currentFiles.push(file);

        });

        if(this.options.mimeType && filesArr.length === this.currentErrors.length){
            this._displayError();
        }

        if(this.options.mimeType){

            let index = parseInt(1 + this.currentErrors.length);

            this.currentFiles.forEach((file, i) => {

                this._getFormat(escape(file.name), file, (url, headerString) => {

                    const mimeType = this._getMimeType(headerString);

                    if(this.options.fileExtensions.length && !this._isValidMimeType(mimeType)){
                        this.currentErrors.push({
                            error: new Error("Mime Type is not valid").code = "EXTENSION",
                            mimeType: this._getExtension(file.name),
                            file: file,
                            message: this.text[this.options.language].textFileNotValid
                        });
                        this.currentFiles.splice(currentFiles.findIndex(x => x.name === file.name), 1);
                    }

                    if(filesArr.length === index){
                        this._checkFiles();
                    }

                    index++;

                });
            });

            return;
        }

        this._checkFiles();

    }


    /**
     * *******************************************************
     * Check file
     * *******************************************************
     */
    _checkFiles(){

        if(!this._validTotalSize(null, this.currentFiles)){
            this.currentErrors.push({
                error: new Error("Total size is too big").code = "TOTAL_SIZE_MULTIPLE",
                currentFiles: this.currentFiles,
                restSize: this._getRestSize(),
                message: this.text[this.options.language].textTotalFilesSize
            });
            this._displayError();
            return;
        }

        if(this.currentFiles.length){
            this._onSuccess(this.currentFiles);
        }

        if(this.currentErrors.length){
            this._displayError();
        }

    };


    /**
     * *******************************************************
     * On success
     * *******************************************************
     */
    _onSuccess() {

        if(!this.currentErrors.length){
            this._cleanError();
        }

        if(this.options.actionAjax){
            this._uploadFile(this.currentFiles);
        }
        else{
            this._displayResult(this.currentFiles);
        }

    }


    /**
     * *******************************************************
     * Display result
     * *******************************************************
     */
    _displayResult(currentFiles){

        this.filesList = this.filesList.concat(currentFiles);

        this._displayFile();

        this.emit("success", {
            currentFiles: currentFiles,
            files: this.filesList,
            errors: this.currentErrors
        });

    }


    /**
     * *******************************************************
     * Upload file
     * *******************************************************
     */
    _uploadFile(currentFiles){

        if(this.progressBar){
            this.parentInput.classList.add('uploading');
            this.progressBar.classList.add('active');
            this.progressBarContent.style.width = '0%';
        }
        else{
            return;
        }

        const fd = new FormData();

        for (let i = 0; i < currentFiles.length; i++) {
            fd.append(this.fileInput.getAttribute("name") + '[' + i + ']', currentFiles[i]);
        }

        const xhr = new XMLHttpRequest();

        xhr.open("POST", this.options.actionAjax);

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.upload.addEventListener("progress", (evt) => {

            if (evt.lengthComputable) {

                let percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);
                this.progressBarContent.style.width = percentComplete + '%';

                if(percentComplete === 100){
                    setTimeout(() => {
                        this.parentInput.classList.remove('uploading');
                        this.progressBar.classList.remove('active');
                    }, 500);
                }

            }

        });

        xhr.onreadystatechange = (data) => {

            if (xhr.readyState === 4) {
                if (xhr.status === 200){
                    this.displayResult(currentFiles);
                }
                else {

                    progressBarContent.style.width = '0%';

                    this.currentErrors.push({
                        error: new Error("Cannot upload file").code = "UPLOAD",
                        currentFiles: currentFiles,
                        message: this.text[this.options.language].textErrorUpload
                    });

                    this._displayError();

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
    _displayFile(){

        if(!this.filesContent){
            this.filesContent = document.createElement('div');
            this.filesContent.classList.add('w-files__content');
            this.wrapperFiles.appendChild(this.filesContent);
        }
        else{
            this.filesContent.innerHTML = '';
        }

        if(this.filesList.length){
            this.wrapperSelected.innerHTML = this.text[this.options.language].textAfterUpload;
        }
        else{
            this.wrapperSelected.innerHTML = this.text[this.options.language].textBeforeUpload;
        }

        if(this.restSize){
            this.restSize.innerHTML = this._getText(this.text[this.options.language].textSizeRest, this._getRestSize());
        }

        if(this.restFiles){
            this.restFiles.innerHTML = this._getText(this.text[this.options.language].textFileRest, (this.options.maxNbFiles - this.filesList.length));
        }

        this.filesList.forEach((file) => {
            let newFile = document.createElement('div');
            newFile.classList.add('file');
            newFile.innerHTML =
                '<span class="file__delete"></span>'+
                '<span class="file__name">'+ this._getFileName(file.name) +'</span>'+
                '<span class="file__size">('+ this._getFileSize(file.size) +')</span>';
            this.filesContent.appendChild(newFile);
            newFile.querySelector('.file__delete').addEventListener("click", this._removeFile.bind(this));
        });
    };


    /**
     * *******************************************************
     * Remove file from array
     * *******************************************************
     */
    _removeFile(e){
        const nodes = Array.prototype.slice.call(this.filesContent.children);
        const index = nodes.indexOf(e.target.parentNode);
        const file = this.filesList[index];
        this.filesList.splice(index, 1);
        this._displayFile();
        this.emit("delete", {
            "file": file,
            "filesList": this.filesList
        });
    };


    /**
     * *******************************************************
     * Clean error
     * *******************************************************
     */
    _cleanError(){
        if(this.parentInput){
            this.parentInput.classList.remove('error-upload');
        }
        if(this.wrapperError && this.wrapperError.parentNode){
            this.wrapperError.parentNode.removeChild(this.wrapperError);
        }
    };


    /**
     * *******************************************************
     * Get format
     * *******************************************************
     */
    _getFormat(url, blob, callback){
        var fileReader = new FileReader();
        this.parentInput.classList.add('loading');
        fileReader.onloadend = (e) => {
            var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
            var header = "";
            for (var i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }
            this.parentInput.classList.remove('loading');
            callback(url, header);
        };
        fileReader.readAsArrayBuffer(blob);
    }


    /**
     * *******************************************************
     * Get extension
     * *******************************************************
     */
    _getExtension(filename){
        return filename.split('.').length > 1 ? '.'+ filename.split('.').pop().toLowerCase() : null;
    };


    /**
     * *******************************************************
     * Get mime type
     * *******************************************************
     */
    _getMimeType(headerString){
        let type = "";
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
    _isValidMimeType(mimeType){
        if(Array.isArray(mimeType)){
            for(let i = 0; i <= mimeType.length; i++){
                if(this.options.fileExtensions.indexOf(mimeType[i]) !== -1){
                    return true;
                }
            }
            return false;
        }
        else{
            if(this.options.fileExtensions.indexOf(mimeType) !== -1){
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
    _validSize(file){
        let fileSize = file.size / 1024 / 1024;
        if (fileSize < this.options.maxFileSize) {
            return true;
        }
        return false;
    };


    /**
     * *******************************************************
     * Check if total size is valid
     * *******************************************************
     */
    _validTotalSize(file=null, files=this.filesList){
        return Math.round(this.maxTotalFilesSize) >= this._getTotalSize(file, files);
    };


    /**
     * *******************************************************
     * Return text with replace
     * *******************************************************
     */
    _getText(text, value){
        if(typeof value === 'string' && value.match(/\d+/)[0] > 1 || typeof value === 'number' && value > 1){
            return text.replace(/{{number}}/g, value).replace(/{{s}}/g, 's');
        }
        else{
            return text.replace(/{{number}}/g, value).replace(/{{s}}/g, '');
        }
    }


    /**
     * *******************************************************
     * Return size rest
     * *******************************************************
     */
    _getRestSize(files=this.filesList){
        return this._getFileSize(this.maxTotalFilesSize - this._getTotalSize(null, files));
    };


    /**
     * *******************************************************
     * Return total size of files list
     * *******************************************************
     */
    _getTotalSize(file, files){
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
    _getFileSize(size){
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
    _getFileName(filename){
        let ext = filename.split('.').pop();
        let length = filename.length - ext.length - 1;
        if(length > this.options.limitCharacters){
            filename = filename.substr(0, this.options.limitCharacters) + '(...).' + ext;
        }
        return filename;
    };


    /**
     * *******************************************************
     * Return form data
     * *******************************************************
     */
    _getFormData(form){
        let formData = new FormData(form[0]);
        for (let i = 0; i < this.filesList.length; i++) {
            formData.append(fileInput.getAttribute("name") + '[' + i + ']', this.filesList[i]);
        }
        return formData;
    };


    /**
     * *******************************************************
     * Update
     * *******************************************************
     */
    update(settings){

        if(!this.fileInput || !settings || !Object.keys(settings).length){
            return;
        }

        if(Object.keys(settings).length === 1 && settings.language){
            Upload.language = settings.language;
        }
        else{
            this.reset(settings);
        }

    }

    /**
     * *******************************************************
     * Reset
     * *******************************************************
     */
    reset(settings={}){

        this.filesList = [];
        this.fileInput.value = '';

        if(this.wrapperInformation){

            this._cleanError();

            this.wrapperInformation.remove();

            if(this.wrapperFiles){
                this.wrapperFiles.remove();
            }

            this.filesContent = '';

        }

        if(this.wrapperBtnUpload){
            this.wrapperBtnUpload.remove();
        }

        this.init(settings);

    }


    /**
     * *******************************************************
     * Clear
     * *******************************************************
     */
    _clear(){
        if(this.wrapperInformation){
            this.filesList = [];
            this._cleanError();
            this._displayFile();
        }
    };


    /**
     * *******************************************************
     * Display Errors
     * *******************************************************
     */
    _displayError(){

        if(this.wrapperInformation){

            this._cleanError();

            this.wrapperError = document.createElement('div');
            this.wrapperError.classList.add('w-information__error');

            const errorSize = this.currentErrors.filter(x => x.error === 'SIZE');

            if(errorSize.length){
                let error = document.createElement('span');
                let text = errorSize.length === 1 ? this.text[this.options.language].textFileTooBig : this.text[this.options.language].textMultipleFileTooBig;

                if(this.options.displayFilenameError){
                    errorSize.forEach((currentError, i) => {
                        text += i ? ', ' + this._getFileName(currentError.file.name) : ' ' + this._getFileName(currentError.file.name);
                    });
                }

                error.innerHTML = text;
                this.wrapperError.appendChild(error);
            }

            const errorExtension = this.currentErrors.filter(x => x.error === 'EXTENSION');

            if(errorExtension.length){
                let error = document.createElement('span');
                let text = errorExtension.length === 1 ? this.text[this.options.language].textFileNotValid : this.text[this.options.language].textMultipleFileNotValid;

                if(this.options.displayFilenameError){
                    errorExtension.forEach((currentError, i) => {
                        text += i ? ', ' + this._getFileName(currentError.file.name) : ' ' + this._getFileName(currentError.file.name);
                    });
                }

                error.innerHTML = text;
                this.wrapperError.appendChild(error);
            }

            this.currentErrors.forEach((currentError) => {
                if(currentError.error !== 'EXTENSION' && currentError.error !== 'SIZE'){
                    let error = document.createElement('span');
                    error.innerHTML = currentError.message;
                    this.wrapperError.appendChild(error);
                }
            });

            this.wrapperInformation.appendChild(this.wrapperError);

            this.parentInput.classList.add('error-upload');
        }

        this.emit("error", {
            errors: this.currentErrors
        });

    };

    /**
     * *******************************************************
     * Test if object keys are equal
     * *******************************************************
     */
    _compareKeys(a, b) {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    /**
     * *******************************************************
     * Return files list
     * *******************************************************
     */
    get files() {
        return this.filesList;
    };

    /**
     * *******************************************************
     * Set new language
     * *******************************************************
     */
    set language(language) {

        if(!language || this.options.language === language || !this.fileInput){
            return
        }

        this.options.language = language;

        this._cleanError();

        if(this.filesList.length){
            this.wrapperSelected.innerHTML = this.text[this.options.language].textAfterUpload;
        }
        else{
            this.wrapperSelected.innerHTML = this.text[this.options.language].textBeforeUpload;
        }

        if(this.options.displayRestSize){
            this.restSize.innerHTML = this._getText(this.text[this.options.language].textSizeRest, this._getRestSize());
        }

        if(this.options.displayMaxFileSize){
            this.maxFileSize.innerHTML = this._getText(this.text[this.options.language].textMaxFileSize, this._getFileSize(this.options.maxFileSize * 1048576));
        }

        if(this.options.displayRestFiles){
            this.restFiles.innerHTML = this._getText(this.text[this.options.language].textFileRest, this.options.maxNbFiles);
        }
    }

    /**
     * *******************************************************
     * Merge objects
     * *******************************************************
     */
    _mergeObjects() {
        var resObj = {};
        for(var i=0; i < arguments.length; i += 1) {
            var obj = arguments[i],
                keys = Object.keys(obj);
            for(var j=0; j < keys.length; j += 1) {
                resObj[keys[j]] = obj[keys[j]];
            }
        }
        return resObj;
    }

}
