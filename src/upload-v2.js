export default class Upload {

    constructor(){

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
            displayRestSize: true,
            displayRestFiles: true,
            displayFilenameError: true,
            multiple: true,
            mimeType: false,
            fileExtensions: [".jpg", ".jpeg", ".png", ".pdf"],
            dropZone: false,
            actionAjax: null,
            language: 'fr',
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
        this.labelInput;
        this.wrapperSelected;
        this.wrapperError;
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

    init = (settings) => {

        this.options = Object.assign(this.options, settings);

        this.maxTotalFilesSize = this.options.maxTotalFilesSize * 1048576;

        this.fileInput  = document.querySelector(this.options.selector);

        if(!this.fileInput){
            return;
        }

        this.parentInput = this.fileInput.parentNode;

        this.labelInput = this.parentInput.querySelector('label');

        this.wrapperInput = document.createElement('div');
        this.wrapperInput.classList.add('w-input');

        this.parentInput.replaceChild(this.wrapperInput, this.fileInput);
        this.wrapperInput.appendChild(this.fileInput);

        if(this.options.displayRestSize || this.options.displayRestFiles){

            this.wrapperInformation = document.createElement('div');
            this.wrapperInformation.classList.add('w-information');
            this.parentInput.appendChild(this.wrapperInformation);

            if(this.options.displayRestSize){
                this.restSize = document.createElement('div');
                this.restSize.classList.add('w-information__size');
                this.restSize.innerHTML = this.getRestSize() +' '+ this.options.textRest[this.options.language];
                this.wrapperInformation.appendChild(this.restSize);
            }

            if(this.options.displayRestFiles){
                this.restFiles = document.createElement('div');
                this.restFiles.classList.add('w-information__files');
                this.restFiles.innerHTML = this.options.maxNbFiles +' '+ this.options.textFile[this.options.language] +' '+ this.options.textRest[this.options.language];
                this.wrapperInformation.appendChild(this.restFiles);
            }

        }

        this.wrapperFiles = document.createElement('div');
        this.wrapperFiles.classList.add('w-files');
        this.parentInput.appendChild(this.wrapperFiles);

        this.wrapperSelected = document.createElement('span');
        this.wrapperSelected.classList.add('w-files__selected');
        this.wrapperSelected.innerHTML = this.options.textBeforeUpload[this.options.language];
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

        this.fileInput.addEventListener("change", this.addNewFile);

        if (this.options.dropZone) {
            initDropZone();
        }
    }

    /**
     * *******************************************************
     * Drop Zone
     * *******************************************************
     */
    initDropZone = () => {
        let droppedFiles = false;

        this.labelInput.addEventListener('dragover', function() {
            event.preventDefault(); // prevent default to allow drop
            this.parentInput.classList.add('is-dragover');
        }, false);

        this.labelInput.addEventListener('dragenter', function() {
            this.parentInput.classList.add('is-dragover');
        }, false);

        this.labelInput.addEventListener('dragleave', function() {
            this.parentInput.classList.remove('is-dragover');
        }, false);

        this.labelInput.addEventListener('dragend', function() {
            this.parentInput.classList.remove('is-dragover');
        }, false);

        this.labelInput.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.parentInput.classList.remove('is-dragover');
            droppedFiles = e.dataTransfer.files;
            addNewFile(e, droppedFiles);
        }, false);
    };


    /**
     * *******************************************************
     * Add a new file in array
     * *******************************************************
     */
    addNewFile = (event, files=[]) => {

        this.currentFiles = [];
        this.currentErrors = [];

        let filesArr = files.length ? files : event.target.files ? event.target.files : null;

        if(!filesArr){
            return;
        }

        if(this.options.maxNbFiles && this.options.maxNbFiles < filesArr.length){
            this.currentErrors.push({
                error: new Error("Limit files !").code = "TOO_MANY_FILES",
                message: this.options.textTooManyFiles[this.options.language]
            });
            this.displayError();
            return;
        }

        if(this.options.maxNbFiles && this.options.maxNbFiles === this.filesList.length){
            this.currentErrors.push({
                error: new Error("Limit files !").code = "TOO_MANY_FILES",
                message: this.options.textTotalFiles[this.options.language]
            });
            this.displayError();
            return;
        }

        Object.values(filesArr).forEach((file, i) => {

            const extension = file.name.split('.').length > 1 ? '.'+ file.name.split('.').pop().toLowerCase() : null;

            if(this.options.fileExtensions.length && this.options.fileExtensions.indexOf(extension) === -1){
                this.currentErrors.push({
                    error: new Error("Extension is not valid").code = "EXTENSION",
                    mimeType: extension,
                    file: file,
                    message: this.options.textFileNotValid[this.options.language]
                });
                return;
            }

            if(!this.validSize(file)){
                this.currentErrors.push({
                    error: new Error("Size is too big").code = "SIZE",
                    file: file,
                    fileSize: getFileSize(file.size),
                    message: this.options.textFileTooBig[this.options.language]
                });
                return;
            }

            if(!this.validTotalSize(file)){
                this.currentErrors.push({
                    error: new Error("Total size is too big").code = "TOTAL_SIZE",
                    file: file,
                    fileSize: this.getFileSize(file.size),
                    restSize: this.getRestSize(),
                    message: this.options.textTotalFilesSize[this.options.language]
                });
                return;
            }

            this.currentFiles.push(file);

        });

        if(this.options.mimeType && this.filesArr.length === this.currentErrors.length){
            this.displayError();
        }

        if(this.options.mimeType){

            let index = parseInt(1 + this.currentErrors.length);

            this.currentFiles.forEach((file, i) => {

                this.getFormat(escape(file.name), file, (url, headerString) => {

                    const mimeType = this.getMimeType(headerString);

                    if(this.options.fileExtensions.length && !this.isValidMimeType(mimeType)){
                        this.currentErrors.push({
                            error: new Error("Mime Type is not valid").code = "EXTENSION",
                            mimeType: this.getExtension(file.name),
                            file: file,
                            message: this.options.textFileNotValid[this.options.language]
                        });
                        this.currentFiles.splice(currentFiles.findIndex(x => x.name === file.name), 1);
                    }

                    if(filesArr.length === index){
                        this.checkFiles();
                    }

                    index++;

                });
            });

            return;
        }

        this.checkFiles();

    }


    /**
     * *******************************************************
     * Check file
     * *******************************************************
     */
    checkFiles = () => {

        if(!this.validTotalSize(null, this.currentFiles)){
            this.currentErrors.push({
                error: new Error("Total size is too big").code = "TOTAL_SIZE_MULTIPLE",
                currentFiles: this.currentFiles,
                restSize: this.getRestSize(),
                message: this.options.textTotalFilesSize[this.options.language]
            });
            this.displayError();
            return;
        }

        if(this.currentFiles.length){
            this.onSuccess(this.currentFiles);
        }

        if(this.currentErrors.length){
            this.displayError();
        }

    };


    /**
     * *******************************************************
     * On success
     * *******************************************************
     */
    onSuccess = () => {

        if(!this.currentErrors.length){
            this.cleanError();
        }

        if(this.options.actionAjax){
            this.uploadFile(this.currentFiles);
        }
        else{
            this.displayResult(this.currentFiles);
        }

    }


    /**
     * *******************************************************
     * Display result
     * *******************************************************
     */
    displayResult = (currentFiles) => {

        this.filesList = this.filesList.concat(currentFiles);

        this.displayFile();

        this.options.onSuccess({
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
    uploadFile = (currentFiles) => {

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
                        message: this.options.textErrorUpload[this.options.language]
                    });

                    this.displayError();

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
    displayFile = () => {

        if(!this.filesContent){
            this.filesContent = document.createElement('div');
            this.filesContent.classList.add('w-files__content');
            this.wrapperFiles.appendChild(this.filesContent);
        }
        else{
            this.filesContent.innerHTML = '';
        }

        if(this.filesList.length){
            this.wrapperSelected.innerHTML = this.options.textAfterUpload[this.options.language];
        }
        else{
            this.wrapperSelected.innerHTML = this.options.textBeforeUpload[this.options.language];
        }

        if(this.restSize){
            this.restSize.innerHTML = this.getRestSize() +' '+ this.options.textRest[this.options.language];
        }

        if(this.restFiles){
            this.restFiles.innerHTML = (this.options.maxNbFiles - this.filesList.length) +' '+ this.options.textFile[this.options.language] +' '+ this.options.textRest[this.options.language];
        }

        this.filesList.forEach((file) => {
            let newFile = document.createElement('div');
            newFile.classList.add('file');
            newFile.innerHTML =
            '<span class="file__delete"></span>'+
            '<span class="file__name">'+ this.getFileName(file.name) +'</span>'+
            '<span class="file__size">('+ this.getFileSize(file.size) +')</span>';
            this.filesContent.appendChild(newFile);
            newFile.querySelector('.file__delete').addEventListener("click", this.removeFile);
        });
    };


    /**
     * *******************************************************
     * Remove file from array
     * *******************************************************
     */
    removeFile = (e) => {
        const nodes = Array.prototype.slice.call( this.filesContent.children );
        const index = nodes.indexOf(e.target.parentNode);
        const file = this.filesList[index];
        this.filesList.splice(index, 1);
        this.displayFile();
        this.options.onDelete({
            "file": file,
            "filesList": this.filesList
        });
    };


    /**
     * *******************************************************
     * Clean error
     * *******************************************************
     */
    cleanError = () => {
        this.parentInput.classList.remove('error-upload');
        if(this.wrapperError && this.wrapperError.parentNode){
            this.wrapperError.parentNode.removeChild(this.wrapperError);
        }
    };


    /**
     * *******************************************************
     * Get format
     * *******************************************************
     */
    getFormat = (url, blob, callback) => {
        var fileReader = new FileReader();
        this.parentInput.classList.add('loading');
        fileReader.onloadend = function(e) {
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
    getExtension = (filename) => {
        return filename.split('.').length > 1 ? '.'+ filename.split('.').pop().toLowerCase() : null;
    };


    /**
     * *******************************************************
     * Get mime type
     * *******************************************************
     */
    getMimeType = (headerString) => {
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
    isValidMimeType = (mimeType) => {
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
    validSize = (file) => {
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
    validTotalSize = (file=null, files=this.filesList) => {
        return Math.round(this.maxTotalFilesSize) >= this.getTotalSize(file, files);
    };


    /**
     * *******************************************************
     * Return size rest
     * *******************************************************
     */
    getRestSize = (files=this.filesList) => {
        return this.getFileSize(this.maxTotalFilesSize - this.getTotalSize(null, files));
    };


    /**
     * *******************************************************
     * Return files list
     * *******************************************************
     */
    getFiles = () => {
        return this.filesList;
    };


    /**
     * *******************************************************
     * Return total size of files list
     * *******************************************************
     */
    getTotalSize = (file, files) => {
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
    getFileSize = (size) => {
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
    getFileName = (filename) => {
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
    getFormData = (form) => {
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
    update = settings => {

        if(!Object.keys(settings).length){
            return;
        }

        if(Object.keys(settings).length === 1 && settings.language){

            this.this.options.language = settings.language;

            this.cleanError();

            if(this.filesList.length){
                this.wrapperSelected.innerHTML = this.options.textAfterUpload[this.options.language];
            }
            else{
                this.wrapperSelected.innerHTML = this.options.textBeforeUpload[this.options.language];
            }

            if(this.options.displayRest){
                rest.innerHTML = this.getRestSize() +' '+ this.options.textRest[this.options.language];
            }

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
    reset = (settings={}) => {

        if(this.wrapperInformation){

            this.cleanError();

            this.filesList = [];

            this.wrapperInformation.remove();

            if(this.wrapperFiles){
                this.wrapperFiles.remove();
            }

        }

        this.init(settings);

    }


    /**
     * *******************************************************
     * Clear
     * *******************************************************
     */
    clear = () => {
        if(this.wrapperInformation){
            this.filesList = [];
            this.cleanError();
            this.displayFile();
        }
    };


    /**
     * *******************************************************
     * Display Errors
     * *******************************************************
     */
    displayError = () => {

        if(this.wrapperInformation){

            this.cleanError();

            this.wrapperError = document.createElement('div');
            this.wrapperError.classList.add('w-information__error');

            const errorSize = this.currentErrors.filter(x => x.error === 'SIZE');

            if(this.errorSize.length){
                let error = document.createElement('span');
                let text = errorSize.length === 1 ? this.options.textFileTooBig[this.options.language] : this.options.textMultipleFileTooBig[this.options.language];

                if(this.options.displayFilenameError){
                    this.errorSize.forEach((currentError, i) => {
                        text += i ? ', ' + this.getFileName(currentError.file.name) : ' ' + this.getFileName(currentError.file.name);
                    });
                }

                error.innerHTML = text;
                this.wrapperError.appendChild(error);
            }

            const errorExtension = this.currentErrors.filter(x => x.error === 'EXTENSION');

            if(errorExtension.length){
                let error = document.createElement('span');
                let text = errorExtension.length === 1 ? this.options.textFileNotValid[this.options.language] : this.options.textMultipleFileNotValid[this.options.language];

                if(this.options.displayFilenameError){
                    errorExtension.forEach((currentError, i) => {
                        text += i ? ', ' + this.getFileName(currentError.file.name) : ' ' + this.getFileName(currentError.file.name);
                    });
                }

                error.innerHTML = text;
                wrapperError.appendChild(error);
            }

            this.currentErrors.forEach((currentError) => {
                if(currentError.error !== 'EXTENSION' && currentError.error !== 'SIZE'){
                    let error = document.createElement('span');
                    error.innerHTML = currentError.message;
                    wrapperError.appendChild(error);
                }
            });

            this.wrapperInformation.insertBefore(wrapperError, wrapperSelected);

            this.parentInput.classList.add('error-upload');
        }

        this.options.onError({
            errors: this.currentErrors
        });

    };
}
