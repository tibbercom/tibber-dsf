## Purpose

tibber-dsf is a module for looking up data from DSF (Det sentrale folkeregister). DSF is register of residents in Norway.
The module expose just a subset of the DSF-services (hent_detaljer_v2).

To obtain login credentials and other permissions go to infotorg.no

## Install

NPM:
```
$ npm install --save tibber-dsf
```

Yarn:

```
$ yarn add tibber-dsf
```

## Usage

````
import dsf from 'tibber-dsf';

const queryDsf = dsf({ env: 'prod or test ', system: 'name of your system', user: 'your username', pwd: 'your password' })

const result = await queryDsf({ userRef: "some user identifier", lastName: 'Normann', postalCode: "6812", firstName:'Ola', birthDate : '1977-01-13' });

//success result

//{ 
//  success: true,
//  result: { 
//     born: '1977-01-13',
//     ssn: '13017711111',
//     lastName: 'Normann',
//     firstName: 'Ola',
//     middleName: '',
//     isDeceased: false,
//     gender: male,
//     hasSecretAddress: false,
//     address: { address: 'Some Street 31',
//        postalCode: '6812',
//        city: 'FØRDE',
//        municipalityCode: '1432',
//        municipality: 'FØRDE'
//        }
//    }
//}

//error result

//{
//   success: false,
//   error: "some error message"
//}


````