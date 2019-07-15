import Upload from '../src/upload.js';

const ru = {
    textBtnUpload: 'Ajouter un fichier',
    textBeforeUpload: 'Aucun fichier sélectionné',
    textAfterUpload: 'Vos fichiers',
    textSizeRest: '{{number}} restant',
    textFileRest: '{{number}} fichier{{s}} restant{{s}}',
    textMaxFileSize: '{{number}} maximum par fichier',
    textFileNotValid: "Votre fichier n'est pas valide:",
    textMultipleFileNotValid: "Vos fichiers ne sont pas valides:",
    textFileTooBig: "Votre fichier est trop lourd:",
    textMultipleFileTooBig: "Vos fichiers sont trop lourd:",
    textTotalFilesSize: "Le poids total de vos fichiers est trop lourd.",
    textTooManyFiles: "Trop de fichiers téléchargés !",
    textTotalFiles: "La limite du nombre de fichier est atteinte",
    textErrorsUpload: "Une erreur est survenue, impossible de télécharger le fichier."
};

const form = document.querySelector('form');

const settings = {
    selector: '.input-test',
    maxFileSize: 100,
    maxTotalFilesSize: 10000,
    fileExtensions: [".jpg", ".jpeg", ".png", ".pdf", ".exe"],
    customContent: '<div class="test">Custom content</div>',
    customContentOnly: false,
    dropZone: true,
    language: 'fr',
    languages: {
        ru: ru,
        fr: {
            textBtnUpload: 'This text can be updated'
        }
    }
}


const uploadField = new Upload(settings);

uploadField.on('init', (response) => {
    console.log(response)
});

uploadField.init();

uploadField.on('success', (response) => {
    console.log(response)
});

uploadField.on('delete', (response) => {
    console.log(response)
});

uploadField.on('error', (response) => {
    console.log(response)
});

document.querySelector('#update').addEventListener('click', function() {
    // uploadField.update({language: 'en'});
    uploadField.language = 'en';
});

document.querySelector('#reset').addEventListener('click', function() {
    uploadField.reset();
});


// form.addEventListener('submit',function(e){
//     e.preventDefault();

//     let fd = uploadField.getFormData(form);

//     for (var value of fd.values()) {
//         console.log(value);
//     }

//     // send fd as data to your post/ajax request

// });


