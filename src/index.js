import fs from 'fs';
import Handlebars from 'handlebars';
import xml2js from 'xml2js';
import rp from 'request-promise';
import moment from 'moment-timezone';

const template = Handlebars.compile(fs.readFileSync(__dirname + '/template.xml', 'utf8'));

const testUrl = 'https://ws-test.infotorg.no/ws/ErgoGroup/DetSentraleFolkeregister1_4.pl';
const prodUrl = 'https://ws.infotorg.no/ws/ErgoGroup/DetSentraleFolkeregister1_4.pl'

const convertXml = async xml =>
    await new Promise((resolve, reject) =>
        new xml2js.Parser({ explicitArray: false, normalizeTags: true })
            .parseString(xml, (err, result) => err ? reject(err) : resolve(result))
    );

export default ({ env, system, user, pwd }) => {

    if (!system) throw new Error('"system" must have a value');
    if (!user) throw new Error('"user" must have a value');
    if (!pwd) throw new Error('"user" must have a value');
    if (system.length > 11) throw new Error('"system" must have max 11 characters');

    const session = { user, pwd, system }

    return async ({ userRef, birthDate, lastName, firstName, postalCode }) => {

        if (!userRef) return { success: false, error: "userRef must have value" };

        birthDate = moment.tz(birthDate, 'Europe/Oslo').format('DDMMYY');

        const payload = template({ session, birthDate, lastName, firstName, postalCode, userRef });

        const options = {
            uri: (env && env.toLowerCase() || 'test') === 'test' ? testUrl : prodUrl,
            method: 'POST',
            headers: {
                "Content-Type": "text/xml; charset=utf-8"
            },
            body: payload,
            timeout: 10000
        };

        try {
            let response = await convertXml(await rp(options));

            session.sessionId = response["soap:envelope"]["soap:header"]["brukersesjon:brukersesjon"]["sesjonsid"];

            let result = response["soap:envelope"]["soap:body"]["dsf:detaljer_v2"]["result"];

            if (!result["hov"]) return { success: false, error: "no results" };

            result = result["hov"];

            return {
                success: true,
                result: {
                    born: moment.tz(result.fodt, 'DDMMYY', 'Europe/Oslo').format('YYYY-MM-DD'),
                    ssn: `${result.fodt}${result.pers}`,
                    lastName: result["navn-s"],
                    firstName: result["navn-f"],
                    middleName: result["navn-m"],
                    address: {
                        address: result["adr"],
                        postalCode: result["postn"],
                        city: result["posts"],
                        municipalityCode: result["komnr"],
                        municipality: result["komna"]
                    }
                }
            }
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
}
