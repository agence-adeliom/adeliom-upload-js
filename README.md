# Install
```
yarn add https://antoinewaag@bitbucket.org/adeliomgit/adeliom-upload-js.git
```

# HTML

```
<div>
    <input type="file" name="files[]" id="test">
    <label for="test">Select a file...</label>
</div>

```

# Import
```
import Upload from './upload';
```

# Available options (by default)

```
Upload.init({
    selector: 'input[type="file"]',
    maxFileSize: 2,
    maxTotalFilesSize: 10,
    displayRest: false,
    multiple: true,
    mimeType: true,
    fileExtensions: [".jpg", ".jpeg", ".png", ".pdf", ".xlsx"],
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

```

# Other functions
```
Upload.reset();

Upload.update({
    language: 'en',
    ...
});
```
