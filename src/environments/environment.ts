// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  url: '',
  criptoKey: '4582456213254840',
  production: false,
  googleApiKey: 'AIzaSyC6vqVjFwKuqxxDAwkhwtPoDlLRwAYFC48',// Intur
  url_amazon_s3: 'https://inturfiles.s3.us-east-2.amazonaws.com/folder',

  baseUrl: 'https://mp.albatrosvirtual.com',

  appUrl:'http://localhost:4200/',

  proyectId: "446865680645",// ID DEL PROYECTO PARA LA NOTIFICACION
  topic: "topic_lc",
  providerNotification: "fcm",
 
  firebaseConfig: {
    apiKey: "AIzaSyD3RdIEKHTSMrUEBkjD8ZLry94iiFlj0uE",
    authDomain: "intur-36ce1.firebaseapp.com",
    databaseURL: "https://intur-36ce1.firebaseio.com",
    projectId: "intur-36ce1",
    storageBucket: "intur-36ce1.appspot.com",
    messagingSenderId: "446865680645",
    appId: "1:446865680645:web:11d027cf0e9cc0e67cef6c",
    measurementId: "G-SDPEXPH8LZ"
  }

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
