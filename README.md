# Install
```
yarn add https://bitbucket.org/adeliomgit/adeliom-upload-js.git
```

# HTML

```
// Only an input is needed, html content is generated
<div>
    <label for="test">Select a file...</label>
    <input type="file" name="files[]" id="test">
</div>
```

# Import
```
import Upload from './upload';
```

# Available options (by default)

```
const uploadField = {
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
```

# Add a new language or update one
```
// If you want to add a new language, create a constant with all the keys
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

// If you want to update a language you can specify which key you want to override
const settings = {
    languages: {
        ru: ru,
        fr: {
            textBtnUpload: 'This text is updated'
        }
    }
}
```

# Init Class

```
const uploadField = new Upload(settings);
uploadField.init();
```

# Listener
```
// Need to be called before the init class
uploadField.on('init', (response) => {
    console.log(response)
});

// when a file is uploaded
uploadField.on('success', (response) => {
    console.log(response)
});

// when a file is deleted
uploadField.on('delete', (response) => {
    console.log(response)
});

// when there is an error (file too big, too many files...)
uploadField.on('error', (response) => {
    console.log(response)
});
```

# Methods
```
uploadField.reset();

uploadField.update({
    language: 'en',
    ...
});
```

# Getter
```
uploadField.files;
```

# Setter
```
uploadField.language = 'en';
```
