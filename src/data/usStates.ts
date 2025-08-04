
const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY

const usStates = [
    {
        name: 'Alabama',
        abbreviation: 'AL',
        flagUrl: 'https://flagpedia.net/data/us/mini/al.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29891&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Alaska',
        abbreviation: 'AK',
        flagUrl: 'https://flagpedia.net/data/us/mini/ak.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29892&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Arizona',
        abbreviation: 'AZ',
        flagUrl: 'https://flagpedia.net/data/us/mini/az.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29893&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Arkansas',
        abbreviation: 'AR',
        flagUrl: 'https://flagpedia.net/data/us/mini/ar.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29894&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'California',
        abbreviation: 'CA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ca.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29895&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Colorado',
        abbreviation: 'CO',
        flagUrl: 'https://flagpedia.net/data/us/mini/co.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29896&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Connecticut',
        abbreviation: 'CT',
        flagUrl: 'https://flagpedia.net/data/us/mini/ct.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29897&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Delaware',
        abbreviation: 'DE',
        flagUrl: 'https://flagpedia.net/data/us/mini/de.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29898&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Florida',
        abbreviation: 'FL',
        flagUrl: 'https://flagpedia.net/data/us/mini/fl.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29899&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Georgia',
        abbreviation: 'GA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ga.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29900&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Hawaii',
        abbreviation: 'HI',
        flagUrl: 'https://flagpedia.net/data/us/mini/hi.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29901&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Idaho',
        abbreviation: 'ID',
        flagUrl: 'https://flagpedia.net/data/us/mini/id.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29902&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Illinois',
        abbreviation: 'IL',
        flagUrl: 'https://flagpedia.net/data/us/mini/il.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29903&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Indiana',
        abbreviation: 'IN',
        flagUrl: 'https://flagpedia.net/data/us/mini/in.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29904&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Iowa',
        abbreviation: 'IA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ia.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29905&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Kansas',
        abbreviation: 'KS',
        flagUrl: 'https://flagpedia.net/data/us/mini/ks.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29906&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Kentucky',
        abbreviation: 'KY',
        flagUrl: 'https://flagpedia.net/data/us/mini/ky.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29907&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Louisiana',
        abbreviation: 'LA',
        flagUrl: 'https://flagpedia.net/data/us/mini/la.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29908&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Maine',
        abbreviation: 'ME',
        flagUrl: 'https://flagpedia.net/data/us/mini/me.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29909&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Maryland',
        abbreviation: 'MD',
        flagUrl: 'https://flagpedia.net/data/us/mini/md.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29910&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Massachusetts',
        abbreviation: 'MA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ma.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29911&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Michigan',
        abbreviation: 'MI',
        flagUrl: 'https://flagpedia.net/data/us/mini/mi.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29912&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Minnesota',
        abbreviation: 'MN',
        flagUrl: 'https://flagpedia.net/data/us/mini/mn.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29913&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Mississippi',
        abbreviation: 'MS',
        flagUrl: 'https://flagpedia.net/data/us/mini/ms.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29914&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Missouri',
        abbreviation: 'MO',
        flagUrl: 'https://flagpedia.net/data/us/mini/mo.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29915&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Montana',
        abbreviation: 'MT',
        flagUrl: 'https://flagpedia.net/data/us/mini/mt.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29916&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Nebraska',
        abbreviation: 'NE',
        flagUrl: 'https://flagpedia.net/data/us/mini/ne.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29917&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Nevada',
        abbreviation: 'NV',
        flagUrl: 'https://flagpedia.net/data/us/mini/nv.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29918&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'New Hampshire',
        abbreviation: 'NH',
        flagUrl: 'https://flagpedia.net/data/us/mini/nh.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29919&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'New Jersey',
        abbreviation: 'NJ',
        flagUrl: 'https://flagpedia.net/data/us/mini/nj.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29920&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'New Mexico',
        abbreviation: 'NM',
        flagUrl: 'https://flagpedia.net/data/us/mini/nm.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29921&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'New York',
        abbreviation: 'NY',
        flagUrl: 'https://flagpedia.net/data/us/mini/ny.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29922&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'North Carolina',
        abbreviation: 'NC',
        flagUrl: 'https://flagpedia.net/data/us/mini/nc.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29923&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'North Dakota',
        abbreviation: 'ND',
        flagUrl: 'https://flagpedia.net/data/us/mini/nd.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29924&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Ohio',
        abbreviation: 'OH',
        flagUrl: 'https://flagpedia.net/data/us/mini/oh.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29925&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Oklahoma',
        abbreviation: 'OK',
        flagUrl: 'https://flagpedia.net/data/us/mini/ok.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29926&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Oregon',
        abbreviation: 'OR',
        flagUrl: 'https://flagpedia.net/data/us/mini/or.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29927&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Pennsylvania',
        abbreviation: 'PA',
        flagUrl: 'https://flagpedia.net/data/us/mini/pa.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29928&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Rhode Island',
        abbreviation: 'RI',
        flagUrl: 'https://flagpedia.net/data/us/mini/ri.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29929&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'South Carolina',
        abbreviation: 'SC',
        flagUrl: 'https://flagpedia.net/data/us/mini/sc.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29930&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'South Dakota',
        abbreviation: 'SD',
        flagUrl: 'https://flagpedia.net/data/us/mini/sd.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29931&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Tennessee',
        abbreviation: 'TN',
        flagUrl: 'https://flagpedia.net/data/us/mini/tn.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29932&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Texas',
        abbreviation: 'TX',
        flagUrl: 'https://flagpedia.net/data/us/mini/tx.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29933&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Utah',
        abbreviation: 'UT',
        flagUrl: 'https://flagpedia.net/data/us/mini/ut.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29934&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Vermont',
        abbreviation: 'VT',
        flagUrl: 'https://flagpedia.net/data/us/mini/vt.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29935&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Virginia',
        abbreviation: 'VA',
        flagUrl: 'https://flagpedia.net/data/us/mini/va.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29936&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Washington',
        abbreviation: 'WA',
        flagUrl: 'https://flagpedia.net/data/us/mini/wa.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29937&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'West Virginia',
        abbreviation: 'WV',
        flagUrl: 'https://flagpedia.net/data/us/mini/wv.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29938&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Wisconsin',
        abbreviation: 'WI',
        flagUrl: 'https://flagpedia.net/data/us/mini/wi.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29939&width=800&height=400&apiKey=${apiKey}`
    },
    {
        name: 'Wyoming',
        abbreviation: 'WY',
        flagUrl: 'https://flagpedia.net/data/us/mini/wy.png',
        mapUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&area=NCA29940&width=800&height=400&apiKey=${apiKey}`
    }
];
export default usStates;