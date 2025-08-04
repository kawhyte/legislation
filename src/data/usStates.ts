const usStates = [
    {
        name: 'Alabama',
        abbreviation: 'AL',
        flagUrl: 'https://flagpedia.net/data/us/mini/al.png',
        coords: { lon: -86.791130, lat: 32.806671 },
        zoom: 6
    },
    {
        name: 'Alaska',
        abbreviation: 'AK',
        flagUrl: 'https://flagpedia.net/data/us/mini/ak.png',
        coords: { lon: -152.404419, lat: 61.370716 },
        zoom: 3
    },
    {
        name: 'Arizona',
        abbreviation: 'AZ',
        flagUrl: 'https://flagpedia.net/data/us/mini/az.png',
        coords: { lon: -111.431221, lat: 33.729759 },
        zoom: 6
    },
    {
        name: 'Arkansas',
        abbreviation: 'AR',
        flagUrl: 'https://flagpedia.net/data/us/mini/ar.png',
        coords: { lon: -92.373123, lat: 34.969704 },
        zoom: 6
    },
    {
        name: 'California',
        abbreviation: 'CA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ca.png',
        coords: { lon: -119.681564, lat: 36.116203 },
        zoom: 5
    },
    {
        name: 'Colorado',
        abbreviation: 'CO',
        flagUrl: 'https://flagpedia.net/data/us/mini/co.png',
        coords: { lon: -105.311104, lat: 39.059811 },
        zoom: 6
    },
    {
        name: 'Connecticut',
        abbreviation: 'CT',
        flagUrl: 'https://flagpedia.net/data/us/mini/ct.png',
        coords: { lon: -72.755371, lat: 41.597782 },
        zoom: 8
    },
    {
        name: 'Delaware',
        abbreviation: 'DE',
        flagUrl: 'https://flagpedia.net/data/us/mini/de.png',
        coords: { lon: -75.507141, lat: 39.318523 },
        zoom: 8
    },
    {
        name: 'Florida',
        abbreviation: 'FL',
        flagUrl: 'https://flagpedia.net/data/us/mini/fl.png',
        coords: { lon: -81.686783, lat: 27.766279 },
        zoom: 6
    },
    {
        name: 'Georgia',
        abbreviation: 'GA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ga.png',
        coords: { lon: -83.643074, lat: 32.678123 },
        zoom: 6
    },
    {
        name: 'Hawaii',
        abbreviation: 'HI',
        flagUrl: 'https://flagpedia.net/data/us/mini/hi.png',
        coords: { lon: -157.498337, lat: 21.094318 },
        zoom: 6
    },
    {
        name: 'Idaho',
        abbreviation: 'ID',
        flagUrl: 'https://flagpedia.net/data/us/mini/id.png',
        coords: { lon: -114.478828, lat: 44.240459 },
        zoom: 5
    },
    {
        name: 'Illinois',
        abbreviation: 'IL',
        flagUrl: 'https://flagpedia.net/data/us/mini/il.png',
        coords: { lon: -88.986137, lat: 40.349457 },
        zoom: 6
    },
    {
        name: 'Indiana',
        abbreviation: 'IN',
        flagUrl: 'https://flagpedia.net/data/us/mini/in.png',
        coords: { lon: -86.258278, lat: 39.849426 },
        zoom: 6
    },
    {
        name: 'Iowa',
        abbreviation: 'IA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ia.png',
        coords: { lon: -93.210526, lat: 42.011539 },
        zoom: 6
    },
    {
        name: 'Kansas',
        abbreviation: 'KS',
        flagUrl: 'https://flagpedia.net/data/us/mini/ks.png',
        coords: { lon: -98.524788, lat: 38.504047 },
        zoom: 6
    },
    {
        name: 'Kentucky',
        abbreviation: 'KY',
        flagUrl: 'https://flagpedia.net/data/us/mini/ky.png',
        coords: { lon: -84.670067, lat: 37.668140 },
        zoom: 6
    },
    {
        name: 'Louisiana',
        abbreviation: 'LA',
        flagUrl: 'https://flagpedia.net/data/us/mini/la.png',
        coords: { lon: -91.867805, lat: 31.169546 },
        zoom: 6
    },
    {
        name: 'Maine',
        abbreviation: 'ME',
        flagUrl: 'https://flagpedia.net/data/us/mini/me.png',
        coords: { lon: -69.381927, lat: 44.693947 },
        zoom: 6
    },
    {
        name: 'Maryland',
        abbreviation: 'MD',
        flagUrl: 'https://flagpedia.net/data/us/mini/md.png',
        coords: { lon: -76.802101, lat: 39.063946 },
        zoom: 7
    },
    {
        name: 'Massachusetts',
        abbreviation: 'MA',
        flagUrl: 'https://flagpedia.net/data/us/mini/ma.png',
        coords: { lon: -71.530106, lat: 42.230171 },
        zoom: 7
    },
    {
        name: 'Michigan',
        abbreviation: 'MI',
        flagUrl: 'https://flagpedia.net/data/us/mini/mi.png',
        coords: { lon: -84.536095, lat: 43.326618 },
        zoom: 6
    },
    {
        name: 'Minnesota',
        abbreviation: 'MN',
        flagUrl: 'https://flagpedia.net/data/us/mini/mn.png',
        coords: { lon: -93.900192, lat: 45.694454 },
        zoom: 5
    },
    {
        name: 'Mississippi',
        abbreviation: 'MS',
        flagUrl: 'https://flagpedia.net/data/us/mini/ms.png',
        coords: { lon: -89.678696, lat: 32.741646 },
        zoom: 6
    },
    {
        name: 'Missouri',
        abbreviation: 'MO',
        flagUrl: 'https://flagpedia.net/data/us/mini/mo.png',
        coords: { lon: -92.288368, lat: 38.456085 },
        zoom: 6
    },
    {
        name: 'Montana',
        abbreviation: 'MT',
        flagUrl: 'https://flagpedia.net/data/us/mini/mt.png',
        coords: { lon: -110.454353, lat: 46.921925 },
        zoom: 5
    },
    {
        name: 'Nebraska',
        abbreviation: 'NE',
        flagUrl: 'https://flagpedia.net/data/us/mini/ne.png',
        coords: { lon: -98.268082, lat: 41.125370 },
        zoom: 6
    },
    {
        name: 'Nevada',
        abbreviation: 'NV',
        flagUrl: 'https://flagpedia.net/data/us/mini/nv.png',
        coords: { lon: -117.055374, lat: 38.313515 },
        zoom: 5
    },
    {
        name: 'New Hampshire',
        abbreviation: 'NH',
        flagUrl: 'https://flagpedia.net/data/us/mini/nh.png',
        coords: { lon: -71.563896, lat: 43.452492 },
        zoom: 7
    },
    {
        name: 'New Jersey',
        abbreviation: 'NJ',
        flagUrl: 'https://flagpedia.net/data/us/mini/nj.png',
        coords: { lon: -74.521011, lat: 40.298904 },
        zoom: 7
    },
    {
        name: 'New Mexico',
        abbreviation: 'NM',
        flagUrl: 'https://flagpedia.net/data/us/mini/nm.png',
        coords: { lon: -106.248482, lat: 34.840515 },
        zoom: 6
    },
    {
        name: 'New York',
        abbreviation: 'NY',
        flagUrl: 'https://flagpedia.net/data/us/mini/ny.png',
        coords: { lon: -74.948051, lat: 42.165726 },
        zoom: 6
    },
    {
        name: 'North Carolina',
        abbreviation: 'NC',
        flagUrl: 'https://flagpedia.net/data/us/mini/nc.png',
        coords: { lon: -79.806419, lat: 35.630066 },
        zoom: 6
    },
    {
        name: 'North Dakota',
        abbreviation: 'ND',
        flagUrl: 'https://flagpedia.net/data/us/mini/nd.png',
        coords: { lon: -99.784012, lat: 47.528912 },
        zoom: 6
    },
    {
        name: 'Ohio',
        abbreviation: 'OH',
        flagUrl: 'https://flagpedia.net/data/us/mini/oh.png',
        coords: { lon: -82.764915, lat: 40.388783 },
        zoom: 6
    },
    {
        name: 'Oklahoma',
        abbreviation: 'OK',
        flagUrl: 'https://flagpedia.net/data/us/mini/ok.png',
        coords: { lon: -96.928917, lat: 35.565342 },
        zoom: 6
    },
    {
        name: 'Oregon',
        abbreviation: 'OR',
        flagUrl: 'https://flagpedia.net/data/us/mini/or.png',
        coords: { lon: -122.070938, lat: 44.572021 },
        zoom: 6
    },
    {
        name: 'Pennsylvania',
        abbreviation: 'PA',
        flagUrl: 'https://flagpedia.net/data/us/mini/pa.png',
        coords: { lon: -77.264091, lat: 40.590752 },
        zoom: 6
    },
    {
        name: 'Rhode Island',
        abbreviation: 'RI',
        flagUrl: 'https://flagpedia.net/data/us/mini/ri.png',
        coords: { lon: -71.511780, lat: 41.680893 },
        zoom: 9
    },
    {
        name: 'South Carolina',
        abbreviation: 'SC',
        flagUrl: 'https://flagpedia.net/data/us/mini/sc.png',
        coords: { lon: -80.945007, lat: 33.856892 },
        zoom: 7
    },
    {
        name: 'South Dakota',
        abbreviation: 'SD',
        flagUrl: 'https://flagpedia.net/data/us/mini/sd.png',
        coords: { lon: -99.438828, lat: 44.299782 },
        zoom: 6
    },
    {
        name: 'Tennessee',
        abbreviation: 'TN',
        flagUrl: 'https://flagpedia.net/data/us/mini/tn.png',
        coords: { lon: -86.692345, lat: 35.747845 },
        zoom: 6
    },
    {
        name: 'Texas',
        abbreviation: 'TX',
        flagUrl: 'https://flagpedia.net/data/us/mini/tx.png',
        coords: { lon: -97.563461, lat: 31.054487 },
        zoom: 5
    },
    {
        name: 'Utah',
        abbreviation: 'UT',
        flagUrl: 'https://flagpedia.net/data/us/mini/ut.png',
        coords: { lon: -111.862434, lat: 40.150032 },
        zoom: 6
    },
    {
        name: 'Vermont',
        abbreviation: 'VT',
        flagUrl: 'https://flagpedia.net/data/us/mini/vt.png',
        coords: { lon: -72.710686, lat: 44.045876 },
        zoom: 7
    },
    {
        name: 'Virginia',
        abbreviation: 'VA',
        flagUrl: 'https://flagpedia.net/data/us/mini/va.png',
        coords: { lon: -78.169968, lat: 37.769337 },
        zoom: 6
    },
    {
        name: 'Washington',
        abbreviation: 'WA',
        flagUrl: 'https://flagpedia.net/data/us/mini/wa.png',
        coords: { lon: -121.490494, lat: 47.400902 },
        zoom: 6
    },
    {
        name: 'West Virginia',
        abbreviation: 'WV',
        flagUrl: 'https://flagpedia.net/data/us/mini/wv.png',
        coords: { lon: -80.954453, lat: 38.491226 },
        zoom: 7
    },
    {
        name: 'Wisconsin',
        abbreviation: 'WI',
        flagUrl: 'https://flagpedia.net/data/us/mini/wi.png',
        coords: { lon: -89.616508, lat: 44.268543 },
        zoom: 6
    },
    {
        name: 'Wyoming',
        abbreviation: 'WY',
        flagUrl: 'https://flagpedia.net/data/us/mini/wy.png',
        coords: { lon: -107.302490, lat: 42.755966 },
        zoom: 6
    }
];
export default usStates;
