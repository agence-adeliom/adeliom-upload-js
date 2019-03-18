import Upload from '../src/upload.js';

var form = document.querySelector('form');

Upload.init({
    language: 'fr',
    actionAjax: 'upload.php',
    maxFileSize: 10000,
    maxTotalFilesSize: 10000,
    fileExtensions: [".jpg", ".jpeg", ".png", ".pdf", ".exe"],
    onError: (callback) => {
        console.log(callback);
    },
    onSuccess: (callback) => {
        console.log(callback);
    },
    onDelete: (callback) => {
        console.log(callback);
    }
});


form.addEventListener('submit',function(e){
    e.preventDefault();

    reset();

    let fd = getFormData(form);

    for (var value of fd.values()) {
        console.log(value);
    }


    // send fd as data to your post/ajax request

});