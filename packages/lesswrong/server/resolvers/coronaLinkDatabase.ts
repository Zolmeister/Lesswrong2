import { addGraphQLSchema, addGraphQLResolvers, addGraphQLQuery } from '../../lib/vulcan-lib/graphql';
import { getSetting } from '../../lib/vulcan-lib';
import request from 'request';

const CoronavirusDataRow = `type CoronaVirusDataRow {
    accepted: String,
    imp: String,
    link: String,
    shortDescription: String,
    url: String ,
    description: String,
    domain: String,
    type: String,
    reviewerThoughts: String,
    foundVia: String,
    sourceLink: String,
    sourceLinkDomain: String,
    lastUpdated: String,
    title: String,
    dateAdded: String,
    category: String
}`

addGraphQLSchema(CoronavirusDataRow);

const CoronavirusDataSchema = `type CoronaVirusDataSchema {
    range: String,
    majorDimension: String,
    values: [CoronaVirusDataRow!]
}`

addGraphQLSchema(CoronavirusDataSchema);

const googleSheetsAPIKey = getSetting('googleSheets.apiKey', null)

async function getDataFromSpreadsheet(spreadsheetId: string, rangeString: string) {
    return new Promise((resolve, reject) => {
        request.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeString}?key=${googleSheetsAPIKey}`, (err, response, body) => {
            if (err) reject(err);
            return resolve(body);
        })
    }) 
}

const coronaVirusSheetId = `1aXBq5edfzvOz22rot6JvMeKD0tRF9-w4fF500fIrvcs`
const allLinksRangeString = `'All Links'!1:1000`

const coronaVirusResolvers = {
  Query: {
    async CoronaVirusData(root, args, context) {
        const rawCoronavirusData:any = await getDataFromSpreadsheet(coronaVirusSheetId, allLinksRangeString)
        const processedData = JSON.parse(rawCoronavirusData)
        const [ headerRow, ...otherRows ] = processedData.values
        const newValues = otherRows.map(([ 
            accepted, imp, link, shortDescription, 
            url, description, domain, 
            type, reviewerThoughts, foundVia, 
            sourceLink, sourceLinkDomain, lastUpdated, 
            title, dateAdded, category
        ]) => ({
            accepted, imp, link, shortDescription,
            url, description, domain,
            type, reviewerThoughts, foundVia,
            sourceLink, sourceLinkDomain, lastUpdated,
            title, dateAdded, category
        }))
        return {
            ...processedData,
            values: newValues
        }
    }
  },
};

addGraphQLResolvers(coronaVirusResolvers);

addGraphQLQuery('CoronaVirusData: CoronaVirusDataSchema');
