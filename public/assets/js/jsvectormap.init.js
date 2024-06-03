/* Template Name: Techwind - Tailwind CSS Multipurpose Landing & Admin Dashboard Template
   Author: Shreethemes
   Email: support@shreethemes.in
   Website: https://shreethemes.in
   Version: 2.0.0
   Created: May 2022
   File Description: For JS Vector map
*/

try {
    var map = new jsVectorMap({
        map: 'world',
        selector: '#map',
        zoomOnScroll: true,
        zoomButtons: true,
        selectedMarkers: [0, 1],
        markersSelectable: true,
        markers:[
            { name: "Texas", coords: [31.9686,-99.9018] },
            { name: "Oklahoma", coords: [35.0078,-97.0929] },
            { name: "Florida", coords: [27.7663,-81.6868] },
            { name: "New York", coords: [43.2994,-74.2179] },
        ],
        markerStyle:{
            initial: { fill: "#4f46e5" },
            selected: { fill: "#059669" }
        },
        labels: {
            markers: {
            render: marker => marker.name
            }
        }
    });
} catch (error) {
    
}