import Upload from '../src/upload-v2.js';

var form = document.querySelector('form');

var settings = {
    selector: '.input-test',
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
}

Upload.init(settings);


// form.addEventListener('submit',function(e){
//     e.preventDefault();

//     reset();

//     let fd = getFormData(form);

//     for (var value of fd.values()) {
//         console.log(value);
//     }


//     // send fd as data to your post/ajax request

// });