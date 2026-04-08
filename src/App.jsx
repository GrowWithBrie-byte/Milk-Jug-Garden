import { useState, useEffect } from "react";

const TODAY = new Date().toISOString().split("T")[0];
const todayMs = new Date(TODAY).getTime();
const daysSince = d => Math.max(0, Math.floor((todayMs - new Date(d).getTime()) / 86400000));

const CONTAINER_TYPES = [
  "Milk Jug","5-Gal Bucket","Plastic Pot","Fabric Bag","Coffee Can","Yogurt Container",
  "Mason Jar","Egg Carton","Takeout Tray","Cardboard Box","Solo Cup","Plastic Bottle","Tin Can",
  "Newspaper Pot","Laundry Basket","Colander","Custom Container"
];

// Presets for non-standard containers — watering method, drainage notes, transplant timing
const CUSTOM_CONTAINER_PRESETS = {
  "Mason Jar":      { emoji:"🫙", drains:false, sizeNote:"~1–3 cups soil depending on jar size", waterNote:"Mason jars have NO drainage — be very careful not to overwater! Water with just 2–3 tbsp at a time. Let soil dry out between waterings. Works best for herbs like mint, basil, and chives indoors.", checkMethod:"👆 Finger test the top — if it feels even slightly damp, wait. Overwatering is the #1 mason jar mistake.", transplantNote:"Great for windowsill herbs! Transplant when roots circle the bottom or plant gets too big.", icon:"🫙" },
  "Egg Carton":     { emoji:"🥚", drains:false, sizeNote:"~1–2 tbsp soil per cell", waterNote:"Mist only — a few sprays per cell. Egg cartons absorb water fast and can get soggy. Keep barely moist.", checkMethod:"👆 Touch the surface — if it feels damp, wait. If dry and pulling away from edges, mist now.", transplantNote:"Transplant seedlings in 1–2 weeks when they have 2 true leaves. The whole carton cell can go in the ground!", icon:"🥚" },
  "Takeout Tray":   { emoji:"🥡", drains:false, sizeNote:"~½–2 cups soil depending on size", waterNote:"Poke drainage holes first if you haven't! Water gently with ~¼ cup at a time. These are shallow so they dry out fast.", checkMethod:"👆 Finger test the center — edges dry first but roots need moisture in the middle.", transplantNote:"Great for starting seeds or growing microgreens. Transplant when plants get 2–3\" tall.", icon:"🥡" },
  "Cardboard Box":  { emoji:"📦", drains:true, sizeNote:"Varies — line with plastic if needed", waterNote:"Water slowly and evenly. Cardboard absorbs water and will eventually break down — that's okay for in-ground planting! Check daily as it can dry unevenly.", checkMethod:"🏋️ Lift test + finger test. Cardboard boxes lose water through the sides too.", transplantNote:"Plant the whole box directly in the ground when ready — cardboard will decompose naturally!", icon:"📦" },
  "Solo Cup":       { emoji:"🥤", drains:false, sizeNote:"~¾ cup soil (16oz cup)", waterNote:"Poke 3–4 holes in the bottom first. Water with ~2–3 tbsp at a time. Small volume dries out very fast — check daily in warm weather.", checkMethod:"👆 Finger test just ½\" deep — these are shallow!", transplantNote:"Transplant in 2–3 weeks when roots reach the bottom. Perfect starter size for herbs and seedlings.", icon:"🥤" },
  "Plastic Bottle": { emoji:"🍶", drains:false, sizeNote:"~1–3 cups soil depending on bottle size", waterNote:"Cut in half and flip the top into the bottom for a self-watering setup! Or cut the side open. Poke drainage holes. Water ~¼ cup at a time.", checkMethod:"🏋️ Lift test — bottles are light so you can feel moisture difference easily.", transplantNote:"Great for one herb plant. Transplant when roots circle the bottom.", icon:"🍶" },
  "Tin Can":        { emoji:"🥫", drains:false, sizeNote:"~½–1 cup soil", waterNote:"Poke several holes in the bottom with a nail — tin cans have NO drainage otherwise! Water ~¼ cup at a time. Metal heats up fast so check moisture twice a day in summer.", checkMethod:"🌡️ Check container temp first — if the can is hot to touch, soil is probably drying fast. Finger test 1\" deep.", transplantNote:"Good for single herb plants. Transplant when roots peek out the bottom.", icon:"🥫" },
  "Newspaper Pot":  { emoji:"📰", drains:true, sizeNote:"~¼–½ cup soil per pot", waterNote:"Mist or bottom water only — newspaper falls apart when soaked from above. Set in a tray with ½\" of water for 10 min to absorb from below.", checkMethod:"👆 Very gentle finger test on the surface. If newspaper feels soggy, skip watering.", transplantNote:"Plant the whole pot — newspaper breaks down in soil. Transplant when seedling has 2+ true leaves.", icon:"📰" },
  "Laundry Basket": { emoji:"🧺", drains:true, sizeNote:"~5–10 gallons of soil", waterNote:"Works like a fabric bag — breathes on all sides and dries out FAST. Water deeply with 1–2 gallons until you see drainage. Check daily in summer.", checkMethod:"🤏 Squeeze the side — if it feels stiff and dry, water now. Same as a fabric bag.", transplantNote:"Great for potatoes, tomatoes, or large plants. Can stay as a permanent container.", icon:"🧺" },
  "Colander":       { emoji:"🪣", drains:true, sizeNote:"~2–5 quarts of soil", waterNote:"Drains extremely fast from all sides — water more often than you think! Line with burlap or newspaper first to hold soil in. Water until it runs through.", checkMethod:"👆 Finger test 1\" deep. Colanders dry out faster than regular pots.", transplantNote:"Great for strawberries and herbs. Usually stays as a permanent planter.", icon:"🪣" },
  "Custom Container":{ emoji:"📦", drains:null, sizeNote:"Check your container size", waterNote:"Water amount depends on your container size. Start with a small amount and check drainage. Always make sure there are holes in the bottom!", checkMethod:"👆 Finger test 1\" deep before every watering. When in doubt, wait a day.", transplantNote:"Transplant when roots start circling the bottom or poking out drainage holes.", icon:"📦" },
};

const TRANSPLANT_MAP = {
  "Mason Jar":         { next:"Coffee Can or Yogurt Container", nextVol:"½–1 gal", daysMin:21, daysMax:42 },
  "Coffee Can":        { next:"Plastic Pot", nextVol:"1–2 gal", daysMin:21, daysMax:35 },
  "Milk Jug":          { next:"5-Gal Bucket", nextVol:"5 gal", daysMin:28, daysMax:45 },
  "Plastic Pot":       { next:"5-Gal Bucket", nextVol:"5 gal", daysMin:28, daysMax:45 },
  "5-Gal Bucket":      { next:"10-Gal Fabric Bag", nextVol:"10 gal", daysMin:60, daysMax:90 },
  "Fabric Bag":        { next:"In-Ground/Raised Bed", nextVol:"N/A", daysMin:60, daysMax:90 },
  "Egg Carton":        { next:"Yogurt Container or Solo Cup", nextVol:"½ gal", daysMin:7, daysMax:14 },
  "Takeout Tray":      { next:"Milk Jug or Plastic Pot", nextVol:"1–2 gal", daysMin:14, daysMax:21 },
  "Cardboard Box":     { next:"Plant directly in ground", nextVol:"N/A", daysMin:21, daysMax:35 },
  "Solo Cup":          { next:"Yogurt Container or Coffee Can", nextVol:"½–1 gal", daysMin:14, daysMax:21 },
  "Plastic Bottle":    { next:"Milk Jug or Coffee Can", nextVol:"1 gal", daysMin:21, daysMax:35 },
  "Tin Can":           { next:"Coffee Can or Plastic Pot", nextVol:"1–2 gal", daysMin:21, daysMax:35 },
  "Newspaper Pot":     { next:"Plant directly in ground", nextVol:"N/A", daysMin:10, daysMax:21 },
  "Laundry Basket":    { next:"In-Ground/Raised Bed", nextVol:"N/A", daysMin:60, daysMax:90 },
  "Colander":          { next:"5-Gal Bucket or Fabric Bag", nextVol:"5–7 gal", daysMin:30, daysMax:60 },
  "Custom Container":  { next:"Larger Container", nextVol:"2× current size", daysMin:21, daysMax:45 },
};

const TRANSPLANT_SIGNS = [
  { id:"leaves2", label:"Has 2 sets of true leaves",         icon:"🍃", tip:"True leaves look different from the first seed leaves (cotyledons). They have the plant's actual shape. 2 sets = you're in the window!" },
  { id:"leaves3", label:"Has 3+ sets of true leaves",        icon:"🍃", tip:"3 sets means the plant is strong enough to handle transplant stress. This alone is your green light — go for it!" },
  { id:"roots",   label:"Roots poking out of drainage holes",icon:"🌿", tip:"Visible roots at the bottom means the plant has outgrown its container — don't wait much longer!" },
  { id:"rootball",label:"Soil holds shape when tipped out",  icon:"🪨", tip:"Gently tip the plant out. If the roots hold the soil together in a ball shape, it's ready." },
  { id:"slow",    label:"Growth has slowed or stalled",      icon:"🐌", tip:"When a plant stops growing despite good water and light, it's usually root-bound and needs more space." },
  { id:"heavy",   label:"Plant looks top-heavy for its pot", icon:"⚖️", tip:"If the plant looks too big for the container, trust your eyes — it probably is!" },
  { id:"dry",     label:"Soil dries out extremely fast",     icon:"🏜️", tip:"When roots fill the container, there's less soil to hold water. Fast drying = root-bound plant." },
  { id:"droop",   label:"Wilts quickly even after watering", icon:"😓", tip:"If the plant perks up right after watering but wilts again within hours, roots are too crowded." },
];

const EMOJI_PRESETS = {
  "🍅":{ name:"Tomatoes",     container:"Milk Jug",        waterEvery:2, sproutMin:5,  sproutMax:10 },
  "🫑":{ name:"Peppers",      container:"Milk Jug",        waterEvery:2, sproutMin:7,  sproutMax:14 },
  "🥬":{ name:"Lettuce",      container:"Milk Jug",        waterEvery:2, sproutMin:2,  sproutMax:8  },
  "🌿":{ name:"Basil",        container:"Yogurt Container",waterEvery:2, sproutMin:5,  sproutMax:10 },
  "🍓":{ name:"Strawberries", container:"Fabric Bag",      waterEvery:1, sproutMin:14, sproutMax:28 },
  "🌸":{ name:"Flowers",      container:"Plastic Pot",     waterEvery:2, sproutMin:7,  sproutMax:21 },
  "🥒":{ name:"Cucumbers",    container:"5-Gal Bucket",    waterEvery:2, sproutMin:3,  sproutMax:7  },
  "🌱":{ name:"Herbs",        container:"Coffee Can",      waterEvery:2, sproutMin:5,  sproutMax:14 },
  "🫚":{ name:"Parsley",      container:"Coffee Can",      waterEvery:2, sproutMin:14, sproutMax:28 },
  "🌾":{ name:"Cilantro",     container:"Yogurt Container",waterEvery:2, sproutMin:7,  sproutMax:10 },
  "🫛":{ name:"Dill",         container:"Milk Jug",        waterEvery:2, sproutMin:7,  sproutMax:14 },
  "🧄":{ name:"Garlic",       container:"5-Gal Bucket",    waterEvery:3, sproutMin:14, sproutMax:21 },
  "🧅":{ name:"Green Onions", container:"Milk Jug",        waterEvery:2, sproutMin:7,  sproutMax:14 },
  "🫖":{ name:"Chamomile",    container:"Yogurt Container",waterEvery:2, sproutMin:7,  sproutMax:14 },
  "🥔":{ name:"Potatoes",     container:"Laundry Basket",  waterEvery:2, sproutMin:14, sproutMax:28 },
  "🍠":{ name:"Sweet Potatoes",container:"5-Gal Bucket",   waterEvery:2, sproutMin:7,  sproutMax:14 },
  "🪴":{ name:"",             container:"Milk Jug",        waterEvery:2, sproutMin:7,  sproutMax:14 },
};

const ZONES = [
  {zone:"1a", temp:"Below -60°F",      emoji:"🥶",color:"#b3e5fc",tc:"#01579b",region:"Fairbanks AK",          plantingTime:"June only",                  indoorStart:"April",            plants:["Microgreens","Chives","Radishes"],                            tips:["Grow indoors or in heated greenhouse","Dark jugs absorb heat"]},
  {zone:"1b", temp:"-60°F to -55°F",   emoji:"🥶",color:"#b3e5fc",tc:"#01579b",region:"N. Alaska interior",    plantingTime:"June–July",                  indoorStart:"April–May",        plants:["Microgreens","Chives","Kale"],                               tips:["Windowsill jug garden works best","Row covers extend outdoor season"]},
  {zone:"2a", temp:"-55°F to -50°F",   emoji:"❄️", color:"#b3e5fc",tc:"#0277bd",region:"Interior Alaska",      plantingTime:"Late May–June",              indoorStart:"March–April",      plants:["Kale","Spinach","Lettuce","Chives"],                          tips:["Containers warm faster than ground","Plastic wrap over jugs = mini greenhouse"]},
  {zone:"2b", temp:"-50°F to -45°F",   emoji:"❄️", color:"#b3e5fc",tc:"#0277bd",region:"N. Minnesota, N. Maine",plantingTime:"May–July",                  indoorStart:"March",            plants:["Lettuce","Spinach","Kale","Peas"],                            tips:["Cluster jugs for warmth","Choose fast-maturing varieties (45–60 days)"]},
  {zone:"3a", temp:"-45°F to -40°F",   emoji:"🌨️",color:"#e1f5fe",tc:"#0288d1",region:"N. Minnesota, Montana", plantingTime:"May–July",                  indoorStart:"March–April",      plants:["Lettuce","Kale","Herbs","Peas","Radishes"],                   tips:["Dark milk jugs absorb more solar heat","Start tomatoes indoors 10 weeks early"]},
  {zone:"3b", temp:"-40°F to -35°F",   emoji:"🌨️",color:"#e1f5fe",tc:"#0288d1",region:"N. Michigan, Vermont",  plantingTime:"May–August",                indoorStart:"March–April",      plants:["Lettuce","Kale","Herbs","Peas"],                              tips:["Containers on south-facing walls gain heat","Cover on nights below 35°F through May"]},
  {zone:"4a", temp:"-35°F to -30°F",   emoji:"🌬️",color:"#dcedc8",tc:"#33691e",region:"Minneapolis, Burlington VT",plantingTime:"Late April–September",  indoorStart:"Feb–March",        plants:["Tomatoes","Lettuce","Herbs","Beans","Cucumbers"],             tips:["Milk jugs great for season extension","Two lettuce harvests: spring and fall"]},
  {zone:"4b", temp:"-30°F to -25°F",   emoji:"🌬️",color:"#dcedc8",tc:"#33691e",region:"Madison WI, Bismarck ND",plantingTime:"Late April–September",    indoorStart:"Feb–March",        plants:["Tomatoes","Peppers","Lettuce","Herbs","Beans"],               tips:["Last frost typically mid-May","Use jugs as cloches over seedlings in spring"]},
  {zone:"5a", temp:"-25°F to -20°F",   emoji:"🌤️",color:"#c8e6c9",tc:"#2e7d32",region:"Chicago IL, Columbus OH",plantingTime:"April–October",            indoorStart:"Late Feb–March",   plants:["Tomatoes","Peppers","Basil","Cucumbers","Lettuce","Strawberries"],tips:["Great zone for milk jug gardening!","Two rounds of lettuce: spring and fall","Bottom water jugs in summer heat"]},
  {zone:"5b", temp:"-20°F to -15°F",   emoji:"🌤️",color:"#c8e6c9",tc:"#2e7d32",region:"Indianapolis, Boston",  plantingTime:"Mid-April–October",         indoorStart:"Late Feb",         plants:["Tomatoes","Peppers","Basil","Cucumbers","Lettuce","Strawberries","Mint"],tips:["Containers can go out earlier than in-ground","Fall container garden extends into October"]},
  {zone:"6a", temp:"-15°F to -10°F",   emoji:"🌿",color:"#a5d6a7",tc:"#1b5e20",region:"St. Louis MO, Louisville KY",plantingTime:"March–November",       indoorStart:"January–February", plants:["Tomatoes","Peppers","Eggplant","Herbs","Cucumbers","Strawberries"],tips:["Three seasons: cool spring, hot summer, cool fall","Shade dark containers from afternoon sun in July/Aug"]},
  {zone:"6b", temp:"-10°F to -5°F",    emoji:"🌿",color:"#a5d6a7",tc:"#1b5e20",region:"Baltimore MD, Cincinnati OH",plantingTime:"March–November",       indoorStart:"January",          plants:["Tomatoes","Peppers","Herbs","Squash","Cucumbers","Strawberries"],tips:["Lettuce and kale can overwinter in protected containers","Bottom watering key in warm summer months"]},
  {zone:"7a", temp:"-5°F to 0°F",      emoji:"🌻",color:"#fff9c4",tc:"#f57f17",region:"Washington DC, Tulsa OK",plantingTime:"March–November",            indoorStart:"January",          plants:["Tomatoes","Peppers","Herbs","Squash","Beans","Kale"],          tips:["Fall garden (Sept–Nov) incredibly productive","Year-round lettuce & kale in containers"]},
  {zone:"7b", temp:"0°F to 5°F",       emoji:"🌻",color:"#fff9c4",tc:"#f57f17",region:"Nashville TN, Charlotte NC",plantingTime:"Feb–December",           indoorStart:"December–January", plants:["Tomatoes","Peppers","Herbs","Squash","Beans","Chard"],         tips:["Start seeds right after New Year!","Afternoon shade for containers in June–August"]},
  {zone:"8a", temp:"5°F to 10°F",      emoji:"☀️", color:"#fff176",tc:"#f57f17",region:"Seattle WA, Dallas TX",  plantingTime:"Feb–December",             indoorStart:"December–January", plants:["Tomatoes","Peppers","Herbs","Squash","Okra","Chard"],          tips:["Light-colored jugs prevent root overheating","Water daily in summer — bottom watering ideal"]},
  {zone:"8b", temp:"10°F to 15°F",     emoji:"☀️", color:"#fff176",tc:"#e65100",region:"Savannah GA, Tucson AZ", plantingTime:"Year-round",                indoorStart:"Start cool crops outdoors in fall",plants:["Tomatoes","Peppers","Sweet Potatoes","Herbs","Okra","Chard"],tips:["Two full seasons: cool Oct–March & warm March–Sept","White containers a must in summer"]},
  {zone:"9a", temp:"15°F to 20°F",     emoji:"🌴",color:"#ffe082",tc:"#e65100",region:"Los Angeles CA, Phoenix AZ",plantingTime:"Year-round",              indoorStart:"N/A",              plants:["Peppers","Herbs","Citrus","Sweet Potatoes","Okra","Chard"],   tips:["Avoid dark containers — they cook roots","Water daily or twice daily June–September","Grow tomatoes Sept–Nov and Feb–May"]},
  {zone:"9b", temp:"20°F to 25°F",     emoji:"🌴",color:"#ffe082",tc:"#e65100",region:"Sacramento CA, Tampa FL",plantingTime:"Year-round",                 indoorStart:"N/A",              plants:["Peppers","Herbs","Sweet Potatoes","Okra","Chard","Citrus"],   tips:["Self-watering jugs shine here","Cool-season crops Oct–March very productive"]},
  {zone:"10a",temp:"25°F to 30°F",     emoji:"🌺",color:"#ffcc80",tc:"#bf360c",region:"Miami FL, S. California coast",plantingTime:"Year-round",           indoorStart:"N/A",              plants:["Herbs","Peppers","Tropical Fruits","Chard","Sweet Potatoes","Beans"],tips:["White containers only","Tomatoes: grow Oct–April only","Shade containers 11am–3pm in summer"]},
  {zone:"10b",temp:"30°F to 35°F",     emoji:"🌺",color:"#ffcc80",tc:"#bf360c",region:"S. Florida tip, Hawaii coastal",plantingTime:"Year-round",          indoorStart:"N/A",              plants:["Tropical Herbs","Peppers","Sweet Potatoes","Beans","Chard","Okra"],tips:["Self-watering milk jugs ideal","Watch for year-round pests"]},
  {zone:"11a",temp:"35°F to 40°F",     emoji:"🌊",color:"#ffab91",tc:"#bf360c",region:"Hawaii lower elevations",plantingTime:"Year-round",                 indoorStart:"N/A",              plants:["Tropical Herbs","Hot Peppers","Sweet Potatoes","Okra","Beans"],tips:["Containers dry out fast — self-watering jugs a must","Shade cloth May–September"]},
  {zone:"11b",temp:"40°F to 45°F",     emoji:"🌊",color:"#ffab91",tc:"#b71c1c",region:"Hawaii tropical valleys",plantingTime:"Year-round",                 indoorStart:"N/A",              plants:["Tropical Herbs","Hot Peppers","Sweet Potatoes","Tropical Greens"],tips:["Water twice daily in dry season","Light-colored containers only"]},
  {zone:"12a",temp:"45°F to 50°F",     emoji:"🏝️",color:"#f48fb1",tc:"#880e4f",region:"Puerto Rico, Hawaii hottest",plantingTime:"Year-round",            indoorStart:"N/A",              plants:["Tropical Herbs","Hot Peppers","Okra","Chard","Sweet Potatoes"],tips:["Self-watering containers highly recommended","Shade cloth almost required"]},
  {zone:"12b",temp:"50°F to 55°F",     emoji:"🏝️",color:"#f48fb1",tc:"#880e4f",region:"Extreme S. Puerto Rico", plantingTime:"Year-round",                indoorStart:"N/A",              plants:["Hot Peppers","Okra","Sweet Potatoes","Heat-Tolerant Herbs"],  tips:["White-painted containers help","Water twice daily minimum"]},
  {zone:"13a",temp:"55°F to 60°F",     emoji:"🌋",color:"#ce93d8",tc:"#6a1b9a",region:"Death Valley CA",         plantingTime:"Year-round (shade required)",indoorStart:"N/A",            plants:["Hot Peppers","Okra","Sweet Potatoes","Heat-Tolerant Herbs"],  tips:["Shade cloth non-negotiable","Grow under pergola or porch"]},
  {zone:"13b",temp:"60°F to 65°F+",    emoji:"🌋",color:"#ce93d8",tc:"#4a148c",region:"Hottest US microclimates",plantingTime:"Year-round (shade/indoor only)",indoorStart:"N/A",         plants:["Hot Peppers","Heat-Tolerant Herbs","Okra"],                   tips:["Indoor container gardening more practical","Self-watering systems essential"]},
];

const PLANT_GUIDES = [
  { name:"Tomatoes",    emoji:"🍅", container:"5-Gal Bucket",     water:"Every 1-2 days", waterBase:1.5, sun:"Full sun",   tip:"Cut the top off a milk jug and plant deep — tomatoes love it!" },
  { name:"Lettuce",     emoji:"🥬", container:"Milk Jug",          water:"Every 2 days",   waterBase:2,   sun:"Part shade", tip:"Milk jugs are perfect! Cut the side for a window box effect." },
  { name:"Basil",       emoji:"🌿", container:"Yogurt Container",  water:"Every 2-3 days", waterBase:2.5, sun:"Full sun",   tip:"Loves warmth. Keep near a sunny window in a 32oz container." },
  { name:"Peppers",     emoji:"🫑", container:"Milk Jug",          water:"Every 2 days",   waterBase:2,   sun:"Full sun",   tip:"Use a gallon milk jug — one plant per jug, drain holes essential!" },
  { name:"Strawberries",emoji:"🍓", container:"Fabric Bag",        water:"Every day",      waterBase:1,   sun:"Full sun",   tip:"Poke holes in the sides of a jug for a strawberry tower!" },
  { name:"Mint",        emoji:"🌱", container:"Coffee Can",        water:"Every 2 days",   waterBase:2,   sun:"Part shade", tip:"Keep contained — mint spreads! A coffee can is ideal." },
  { name:"Parsley",     emoji:"🫚", container:"Coffee Can",        water:"Every 2 days",   waterBase:2,   sun:"Full sun",   tip:"Deep roots love a coffee can or tall jug. Slow to sprout — be patient!" },
  { name:"Cilantro",    emoji:"🌾", container:"Yogurt Container",  water:"Every 2 days",   waterBase:2,   sun:"Part shade", tip:"Bolts fast in heat — in Zone 8b grow it Oct–April for best flavor." },
  { name:"Dill",        emoji:"🫛", container:"Milk Jug",          water:"Every 2-3 days", waterBase:2.5, sun:"Full sun",   tip:"Gets tall! A milk jug gives it room. Plant away from fennel." },
  { name:"Chives",      emoji:"🌿", container:"Coffee Can",        water:"Every 2-3 days", waterBase:2.5, sun:"Full sun",   tip:"Almost impossible to kill. Great coffee can herb — snip & regrow!" },
  { name:"Green Onions",emoji:"🧅", container:"Milk Jug",          water:"Every 2 days",   waterBase:2,   sun:"Full sun",   tip:"Regrow from store-bought scraps in a jug of water on your windowsill!" },
  { name:"Chamomile",    emoji:"🫖", container:"Yogurt Container",  water:"Every 2-3 days", waterBase:2.5, sun:"Full sun",   tip:"Grows easily from seed. Harvest flowers for tea — the more you pick, the more it blooms!" },
  { name:"Potatoes",     emoji:"🥔", container:"Laundry Basket",    water:"Every 2 days",   waterBase:2,   sun:"Full sun",   tip:"Start with 4\" of soil, place seed potato, and add more soil as vines grow — this is called 'hilling' and it's how you get more potatoes!" },
  { name:"Sweet Potatoes",emoji:"🍠",container:"5-Gal Bucket",      water:"Every 2 days",   waterBase:2,   sun:"Full sun",   tip:"Perfect for Zone 8b — plant slips in spring and harvest in fall. They love heat and trailing vines look great spilling over containers!" },
];

const INDOOR_GUIDES = [
  { name:"Basil",        emoji:"🌿", container:"Mason Jar",    water:"Every 2-3 days", waterBase:2.5, sun:"Bright window (S/E facing)", allergySafe:true,  tip:"Best indoor herb! Keep on a south-facing windowsill. Pinch flowers off to keep it bushy and producing.", light:"6+ hrs direct sun", humidity:"Loves humidity — mist leaves occasionally.", growLight:"Works well under a grow light if no sunny window." },
  { name:"Mint",         emoji:"🌱", container:"Coffee Can",   water:"Every 2 days",   waterBase:2,   sun:"Medium light",               allergySafe:true,  tip:"Almost indestructible indoors. Keep in a coffee can — it spreads so containment is key. Great for tea!", light:"4–6 hrs light", humidity:"Tolerates normal indoor humidity.", growLight:"Does fine with a basic grow light." },
  { name:"Chives",       emoji:"🌿", container:"Mason Jar",    water:"Every 2-3 days", waterBase:2.5, sun:"Bright window",              allergySafe:true,  tip:"One of the easiest windowsill herbs. Snip and regrow endlessly. Great in mason jars on the kitchen counter!", light:"4–6 hrs light", humidity:"Not picky about humidity.", growLight:"Grows well under grow lights." },
  { name:"Parsley",      emoji:"🫚", container:"Coffee Can",   water:"Every 2 days",   waterBase:2,   sun:"Bright window (S facing)",   allergySafe:true,  tip:"Slow to start but worth it! Deep roots need a coffee can or tall container. Flat-leaf parsley is more flavorful.", light:"6+ hrs direct sun", humidity:"Normal indoor humidity is fine.", growLight:"Needs a stronger grow light if no sunny window." },
  { name:"Cilantro",     emoji:"🌾", container:"Yogurt Container", water:"Every 2 days", waterBase:2, sun:"Bright window",              allergySafe:true,  tip:"Bolts fast indoors too — keep it cool and harvest often. Great on a north-facing windowsill in summer.", light:"4–6 hrs light", humidity:"Keep soil evenly moist.", growLight:"Does okay under grow lights — keep cool." },
  { name:"Thyme",        emoji:"🌱", container:"Yogurt Container", water:"Every 3 days", waterBase:3, sun:"Sunniest window you have",   allergySafe:true,  tip:"Loves to be slightly dry between waterings. Mediterranean herb — treat it like a sun-loving, drought-tolerant plant indoors.", light:"6+ hrs direct sun", humidity:"Prefers dry air — no misting.", growLight:"Needs a strong grow light to thrive indoors." },
  { name:"Rosemary",     emoji:"🌿", container:"Coffee Can",   water:"Every 3-4 days", waterBase:3.5, sun:"Full sun window",           allergySafe:true,  tip:"Needs the sunniest spot in your home. Let it dry out between waterings. Smells amazing and looks beautiful!", light:"6+ hrs direct sun", humidity:"Prefers dry conditions.", growLight:"Needs a very strong grow light." },
  { name:"Oregano",      emoji:"🌿", container:"Yogurt Container", water:"Every 3 days", waterBase:3, sun:"Bright window",             allergySafe:true,  tip:"Hardy and forgiving indoors. Let soil dry between waterings. Great dried or fresh — snip often to keep it bushy.", light:"6+ hrs light", humidity:"Normal indoor humidity fine.", growLight:"Does well under grow lights." },
  { name:"Lemon Balm",   emoji:"🍋", container:"Plastic Pot",  water:"Every 2 days",   waterBase:2,   sun:"Medium to bright light",     allergySafe:true,  tip:"Smells incredible — like lemon candy! Great for tea and stress relief. Grows fast and is very forgiving for beginners.", light:"4–6 hrs light", humidity:"Likes some humidity.", growLight:"Grows well under basic grow lights." },
  { name:"Lavender",     emoji:"💜", container:"Plastic Pot",  water:"Every 4-5 days", waterBase:4,   sun:"Sunniest window",           allergySafe:false, allergyNote:"Can trigger sensitivities in some people despite being calming for others.", tip:"Needs excellent drainage and lots of sun. Let dry completely between waterings. Smells amazing but needs dedication indoors!", light:"6+ hrs direct sun", humidity:"Prefers dry air.", growLight:"Needs a strong grow light." },
  { name:"Microgreens",  emoji:"🌱", container:"Takeout Tray", water:"Mist daily",     waterBase:1,   sun:"Any bright light",           allergySafe:true,  tip:"The ultimate indoor crop — no sun needed, just a bright room or grow light! Ready to harvest in 7–14 days. Perfect for allergy season!", light:"Any bright indirect light", humidity:"Mist daily — don't soak.", growLight:"Thrives under any grow light." },
  { name:"Green Onions", emoji:"🧅", container:"Mason Jar",    water:"Every 2 days",   waterBase:2,   sun:"Any light",                  allergySafe:true,  tip:"Regrow store-bought green onion scraps in a mason jar of water on your windowsill — no soil needed! Change water every 2 days.", light:"Any light — even low light!", humidity:"Just keep water fresh.", growLight:"Not needed — grows in water!" },
];

const ALLERGY_TIPS = [
  { icon:"🤧", tip:"Keep soil surface moist to reduce dust and mold spores — dry soil kicks up particles when watered." },
  { icon:"🪟", tip:"Garden indoors with windows closed on high pollen days. Check your local pollen count first!" },
  { icon:"🧤", tip:"Wear gloves when handling soil — even indoors. Wash hands after tending plants." },
  { icon:"💨", tip:"Use a HEPA air purifier near your indoor garden to catch any spores or particles." },
  { icon:"🌱", tip:"Choose low-pollen herbs like basil, mint, and chives — they're pollinated by insects, not wind, so very little airborne pollen." },
  { icon:"🚿", tip:"Rinse harvested herbs before using — even indoors, dust can settle on leaves." },
  { icon:"🏠", tip:"Indoor gardening during allergy season means you control the environment — no wind, no outdoor pollen, no bees!" },
];

const TROUBLESHOOTING = [
  {
    id:"leggy", emoji:"🌿", title:"Leggy / Stretched Seedlings",
    color:"#fff9c4", tc:"#f57f17",
    looks:"Seedlings are tall and thin with long gaps between leaves, falling over or leaning toward light.",
    why:"Not enough light! Seedlings stretch toward any light source they can find. Also caused by seeds planted too deep or started too early indoors.",
    fixes:[
      "Move the container to your sunniest window — south-facing is best",
      "If indoors, add a grow light 2–4 inches above seedlings for 14–16 hours/day",
      "Bury the leggy stem deeper when transplanting — tomatoes and peppers especially love this",
      "Rotate the container every day so all sides get equal light",
      "Next time: start seeds closer to your window or under a light from day one",
    ],
    urgent: false,
  },
  {
    id:"overwater", emoji:"💧", title:"Overwatered Plant",
    color:"#e3f2fd", tc:"#1565c0",
    looks:"Yellow or pale leaves, mushy or dark stem near soil, soil stays wet for days, mold on soil surface, plant wilts despite wet soil.",
    why:"Too much water drowns roots and causes root rot. Containers without drainage holes are the #1 cause. Small containers with dense soil hold water too long.",
    fixes:[
      "Stop watering immediately and let the soil dry out completely",
      "Check drainage holes — if clogged, poke them clear with a toothpick",
      "If soil smells musty or roots look brown/mushy, gently tip out the plant and remove rotten roots with clean scissors",
      "Repot in fresh dry potting mix with better drainage",
      "Add a layer of perlite to your soil next time (about 20%) to improve drainage",
      "Always finger-test soil before watering — if it feels damp, wait",
    ],
    urgent: true,
  },
  {
    id:"transplantshock", emoji:"🪴", title:"Transplant Shock",
    color:"#fce4ec", tc:"#c62828",
    looks:"Plant wilts, droops, or loses leaves right after being moved to a new container. May look sad for several days.",
    why:"Totally normal! Moving disturbs roots. The plant is adjusting to new soil and environment. Usually not permanent.",
    fixes:[
      "Water gently right after transplanting to help roots settle",
      "Keep out of direct sun for 2–3 days — indirect light only while recovering",
      "Don't fertilize right after transplanting — it stresses already-stressed roots",
      "Mist leaves lightly once a day to reduce stress while roots establish",
      "Be patient — most plants bounce back within 3–7 days",
      "If leaves are still wilting after 2 weeks, check for root rot or pests",
    ],
    urgent: false,
  },
  {
    id:"fell", emoji:"🤕", title:"Plant Fell Out of Container",
    color:"#fff3e0", tc:"#e65100",
    looks:"Plant is out of its container, roots exposed, soil everywhere.",
    why:"Accidents happen! Tipped over jugs, curious pets, or wind. Act fast — exposed roots dry out quickly.",
    fixes:[
      "Act within minutes — don't leave roots exposed to air",
      "Gently gather any loose soil back into the container",
      "Lower the plant back in, trying to keep the root ball together as much as possible",
      "Fill in gaps with fresh potting mix and firm gently around the base",
      "Water immediately to help roots reconnect with soil",
      "Keep in shade for 2–3 days while it recovers — treat like transplant shock",
      "Don't panic if a few leaves fall — focus on the roots",
    ],
    urgent: true,
  },
  {
    id:"toomanyseeds", emoji:"🌱", title:"Too Many Seeds Germinated",
    color:"#e8f5e9", tc:"#2e7d32",
    looks:"Container is packed with tiny seedlings all competing for space. Dense, crowded sprouts.",
    why:"Most beginners plant too many seeds \"just in case.\" Now they all sprouted!",
    fixes:[
      "Thin seedlings early — the sooner the better",
      "Use small scissors to snip extra seedlings at soil level — don't pull them out (it disturbs neighbors)",
      "Keep only the strongest 1–2 seedlings per container",
      "The hardest part: yes, you have to remove them even if they look healthy",
      "Thinned seedlings can sometimes be transplanted to new containers if roots are intact",
      "Next time: plant 2–3 seeds max per small container, 1 seed per cell in egg cartons",
    ],
    urgent: false,
  },
  {
    id:"mold", emoji:"🍄", title:"Mold on Soil Surface",
    color:"#f3e5f5", tc:"#6a1b9a",
    looks:"White or gray fuzzy growth on top of soil. Sometimes smells musty.",
    why:"Too much moisture on the soil surface, poor air circulation, or overwatering. Very common indoors.",
    fixes:[
      "Scoop off the moldy top layer of soil and discard",
      "Let the soil dry out more between waterings",
      "Improve air circulation — a small fan nearby helps a lot",
      "Sprinkle a thin layer of cinnamon on the soil surface — it's a natural antifungal",
      "Bottom watering instead of top watering keeps the surface dry",
      "Move to a spot with more light and airflow",
      "If mold keeps returning, repot in fresh soil",
    ],
    urgent: false,
  },
  {
    id:"heatstress", emoji:"🥵", title:"Heat Stress / Wilting in Summer",
    color:"#fff9c4", tc:"#e65100",
    looks:"Leaves curl inward, edges turn brown or crispy, plant wilts in afternoon even with moist soil. Dark containers feel very hot to touch.",
    why:"Containers heat up fast in direct sun, especially dark-colored ones. Roots cook before the soil dries out.",
    fixes:[
      "Move containers out of direct afternoon sun (shade from noon–4pm is ideal in summer)",
      "Water in the early morning before heat builds",
      "Wrap dark containers in white paper or foil to reflect heat",
      "Set containers on a wooden surface instead of concrete or metal — they absorb less heat",
      "Group containers together — they shade each other's sides",
      "For Zone 8b summers: most containers need water every 1–2 days minimum",
    ],
    urgent: false,
  },
  {
    id:"pests", emoji:"🐛", title:"Pests on Indoor Plants",
    color:"#ffebee", tc:"#b71c1c",
    looks:"Tiny bugs on leaves or soil, sticky residue on leaves, small holes in leaves, yellowing from the underside.",
    why:"Common indoor pests include fungus gnats (in wet soil), spider mites (dry conditions), and aphids (hitchhike in on new plants).",
    fixes:[
      "Check the undersides of leaves first — most pests hide there",
      "Isolate affected plants immediately to prevent spreading",
      "For fungus gnats: let soil dry out fully between waterings, add a layer of sand on top of soil",
      "For spider mites: wipe leaves with a damp cloth, then spray with diluted dish soap + water",
      "For aphids: blast with water, then apply neem oil spray",
      "Neem oil is safe, organic, and works on most indoor pests — find it at any garden center",
      "Yellow sticky traps near plants catch flying pests before they spread",
    ],
    urgent: false,
  },
  {
    id:"wrongsoil", emoji:"🪨", title:"Used Wrong Soil / Garden Soil in Container",
    color:"#efebe9", tc:"#4e342e",
    looks:"Soil is hard, dense, or concrete-like after watering. Water pools on top and won't drain. Plant growth is slow despite watering.",
    why:"Garden soil compacts in containers, blocking drainage and air to roots. It's designed for in-ground use, not pots.",
    fixes:[
      "If the plant is young, repot now in proper potting mix — the sooner the better",
      "If the plant is established and seems okay, mix in perlite around the edges to improve drainage",
      "Use a chopstick to gently aerate (poke holes in) compacted soil without disturbing roots",
      "Water less frequently until soil drains better",
      "Going forward: always use potting mix (not garden soil or topsoil) in containers",
      "Add 20% perlite to any potting mix for even better drainage",
    ],
    urgent: false,
  },
];

const TRANSPLANT_GUIDES = [
  {
    id:"tomato", name:"Tomatoes", emoji:"🍅", matchNames:["tomato","tomatoes","cherry tomato"],
    freePreview:"Tomatoes love being buried deep — up to ⅔ of the stem can go underground and it'll grow roots all along it. Always transplant in the evening or on a cloudy day.",
    steps:[
      { step:"Harden off first", desc:"If moving outdoors, set the plant outside in shade for 1–2 hours/day for a week first. Sudden sun exposure shocks them badly." },
      { step:"Water the night before", desc:"Moist soil holds together better and reduces root disturbance during transplanting." },
      { step:"Prepare new container", desc:"Fill new container ⅓ with potting mix + compost blend. Make a deep hole — tomatoes get buried deep." },
      { step:"Remove from old container", desc:"Tip the plant upside down, support the stem with two fingers, and let it slide out gently. Don't yank!" },
      { step:"Bury the stem deep", desc:"Place in new container so only the top 3–4 sets of leaves are above soil. Roots will form all along the buried stem." },
      { step:"Firm soil and water", desc:"Press soil gently around the base (no air pockets), then water deeply until drainage. No fertilizer for 2 weeks." },
      { step:"Shade for 3 days", desc:"Keep out of direct sun for 3 days. The plant will look sad — that's normal. It's adjusting." },
    ],
    aftercare:["Water deeply every 1–2 days","Add tomato cage or stake within the first week","First fertilize 2 weeks after transplanting","Watch for transplant shock — wilting that bounces back by evening is normal"],
    commonMistakes:["Planting too shallow — always bury the stem","Fertilizing right away — wait 2 weeks","Full sun immediately — ease in over 3–5 days"],
  },
  {
    id:"pepper", name:"Peppers", emoji:"🫑", matchNames:["pepper","peppers","bell pepper","hot pepper"],
    freePreview:"Peppers are sensitive to root disturbance. Be gentle and keep as much soil around the roots as possible when moving them.",
    steps:[
      { step:"Wait for true warmth", desc:"Don't transplant until nighttime temps stay above 55°F. Cold soil stresses peppers badly." },
      { step:"Water the night before", desc:"Moist soil holds the root ball together — key for peppers since they hate disturbed roots." },
      { step:"Prepare container", desc:"Use potting mix + 20% compost. Peppers are heavy feeders. Make a hole just bigger than the root ball." },
      { step:"Remove carefully", desc:"Squeeze the container sides gently to loosen, then tip out keeping the root ball as intact as possible." },
      { step:"Plant at same depth", desc:"Unlike tomatoes, peppers go in at the same depth they were growing — don't bury the stem." },
      { step:"Water and mulch", desc:"Water gently, then add a thin layer of mulch around the base to keep soil temperature stable." },
      { step:"No direct sun for 4 days", desc:"Peppers show transplant shock more than most plants. Indirect light only for the first 4 days." },
    ],
    aftercare:["Water every 2 days — consistent moisture is key","Fertilize with balanced fertilizer 2 weeks after transplanting","Pinch off first flowers to encourage stronger root development","Support branches as they get heavy with fruit"],
    commonMistakes:["Disturbing roots — be extra gentle","Transplanting in cold weather","Skipping the hardening off process outdoors"],
  },
  {
    id:"herbs", name:"Herbs (General)", emoji:"🌿", matchNames:["basil","mint","parsley","cilantro","dill","chives","oregano","thyme","rosemary","herb","herbs","chamomile","lemon balm"],
    freePreview:"Most herbs transplant easily but hate wet feet after moving. Make sure your new container has great drainage before you start.",
    steps:[
      { step:"Choose the right time", desc:"Morning or evening on a mild day. Avoid transplanting in peak summer heat." },
      { step:"Prepare draining container", desc:"Add perlite to your potting mix (about 20%) for extra drainage. Most herbs die from overwatering not underwatering." },
      { step:"Remove from old container", desc:"Squeeze sides, tip out gently. If roots are tightly coiled, gently loosen them with your fingers." },
      { step:"Plant at same depth", desc:"Match the same soil level as the original container. Burying the crown causes rot on most herbs." },
      { step:"Press and water lightly", desc:"Firm the soil gently and water lightly — just enough to settle the soil, not drench it." },
      { step:"Hold off on big watering", desc:"Wait 2 days before a thorough watering. Herbs establish better when not waterlogged right after moving." },
    ],
    aftercare:["Let soil dry slightly between waterings","Harvest lightly for the first 2 weeks to reduce stress","Fertilize lightly once a month","Pinch flowers off to keep leaf production going"],
    commonMistakes:["Overwatering right after transplanting","Burying the crown below soil level","Harvesting too aggressively right after moving"],
  },
  {
    id:"lettuce", name:"Lettuce & Greens", emoji:"🥬", matchNames:["lettuce","spinach","kale","chard","greens"],
    freePreview:"Lettuce is one of the easiest plants to transplant. The trick is keeping it cool and moist — heat is its enemy during the transition.",
    steps:[
      { step:"Transplant in the evening", desc:"Cool evening temps reduce wilting stress dramatically for lettuce." },
      { step:"Soak root ball first", desc:"Dip the whole root ball in water for a few minutes before moving — lettuce loves this." },
      { step:"Space generously", desc:"Give each plant 6\" of space. Crowded lettuce bolts faster and gets disease." },
      { step:"Plant at same depth", desc:"Keep the crown right at soil level — not buried, not raised." },
      { step:"Water immediately", desc:"Lettuce needs moisture right away. Water thoroughly after planting." },
      { step:"Shade for 2 days", desc:"Cover with a cloth or put in shade for 2 days, especially in warm weather." },
    ],
    aftercare:["Keep soil consistently moist — never let it dry out","Harvest outer leaves first to extend the plant's life","Watch for bolting in heat — harvest immediately if it starts"],
    commonMistakes:["Transplanting in hot afternoon sun","Letting soil dry out after transplanting","Planting too deep"],
  },
  {
    id:"potato", name:"Potatoes", emoji:"🥔", matchNames:["potato","potatoes"],
    freePreview:"Potatoes aren't transplanted the traditional way — they're 'hilled' as they grow. Each time vines get 6\" tall, add more soil. More buried stem = more potatoes!",
    steps:[
      { step:"Start with 4\" of soil", desc:"Place seed potato on 4\" of potting mix + compost in your basket or bucket." },
      { step:"First hilling at 6\" growth", desc:"When vines reach 6\" tall, add 3–4\" more soil to bury the lower stem. Leave the top few leaves showing." },
      { step:"Hill again at next 6\"", desc:"Keep hilling every time vines grow another 6\". Each buried node makes more potatoes." },
      { step:"Stop hilling at container top", desc:"Once soil reaches the top, let the vines grow freely." },
      { step:"Water consistently", desc:"Keep soil evenly moist during flowering — this is when potatoes are forming." },
      { step:"Harvest when vines die back", desc:"When vines yellow and die, wait 2 more weeks, then tip out the container and dig!" },
    ],
    aftercare:["Water deeply every 2 days","Fertilize when flowers appear","Don't let soil dry out during flowering","Cure harvested potatoes in a cool dark place for 2 weeks"],
    commonMistakes:["Not hilling often enough — #1 reason for small harvests","Overwatering before vines establish","Harvesting too soon"],
  },
  {
    id:"fruits", name:"Fruits (Strawberries & Melons)", emoji:"🍓", matchNames:["strawberry","strawberries","watermelon","melon","cantaloupe","citrus","lemon","lime","orange","fruit"],
    freePreview:"Fruits are more sensitive to transplant stress than vegetables — the trick is to disturb the roots as little as possible and keep them hydrated for the first week.",
    steps:[
      { step:"Time it right", desc:"Transplant on a cloudy day or in the evening. Fruits stress badly in hot midday sun right after moving." },
      { step:"Water thoroughly the night before", desc:"A well-hydrated plant handles transplant shock much better. Don't transplant a thirsty plant!" },
      { step:"Prepare container with rich mix", desc:"Use potting mix + 20% compost. Fruits are heavy feeders and need nutrients from day one. Make sure drainage is excellent." },
      { step:"Remove with maximum care", desc:"Squeeze container sides to loosen, tip gently — never pull by the stem. Keep the entire root ball intact. Even small root damage sets fruits back weeks." },
      { step:"Plant at the right depth", desc:"Strawberries: crown should sit just at soil level — never buried, never raised. Melons: same depth as original container. Citrus: plant slightly higher than original soil line to prevent crown rot." },
      { step:"Water slowly and deeply", desc:"Water immediately after planting, slowly and deeply. For strawberries, avoid wetting the crown. For melons, water at the base only." },
      { step:"Protect for one full week", desc:"Shade from direct sun for 5–7 days. Cover with a cloth or move to bright indirect light. Fruits take longer than vegetables to establish." },
    ],
    aftercare:[
      "Water every 1–2 days for the first 2 weeks — fruits need consistent moisture to establish",
      "Pinch off first flowers on strawberries for 2 weeks after transplanting — it feels wrong but builds stronger roots",
      "Fertilize with a bloom fertilizer (high middle number) 3 weeks after transplanting",
      "Watch for runner vines on strawberries — redirect them or snip to keep plant energy focused",
      "For melons: add a trellis or sling support early — fruit gets heavy fast",
    ],
    commonMistakes:[
      "Burying the strawberry crown — it will rot, every time",
      "Transplanting in direct afternoon sun — wait for evening or a cloudy day",
      "Fertilizing too soon — wait at least 3 weeks so roots aren't burned",
      "Letting soil dry out in the first 2 weeks — fruits are unforgiving about this",
    ],
  },
  {
    id:"general", name:"General Guide (Any Plant)", emoji:"🌿", matchNames:[],
    freePreview:"Don't see your specific plant? These universal transplanting rules work for almost any container plant. When in doubt, follow these steps.",
    steps:[
      { step:"Check readiness first", desc:"Look for 2–3 sets of true leaves, roots poking out of drainage holes, or soil drying out extremely fast. If you see any of these, it's time." },
      { step:"Water 12–24 hours before", desc:"This is the single most important prep step. Moist soil holds together, protects roots, and helps the plant handle stress. Never transplant a dry plant." },
      { step:"Prepare the new container first", desc:"Have your new container ready before you start. Fill it ⅓ with fresh potting mix. Make a hole roughly the size of the root ball. Don't rush this step." },
      { step:"Remove gently", desc:"Squeeze flexible containers to loosen. For rigid pots, run a butter knife around the inside edge. Tip upside down, support the base with your palm, and let gravity do the work. Never yank the stem." },
      { step:"Inspect the roots", desc:"Healthy roots are white or light tan. If you see brown mushy roots, trim them with clean scissors. If roots are tightly coiled, gently loosen the outer layer with your fingers." },
      { step:"Set at the right depth", desc:"Most plants go in at the same depth they were growing. Exception: tomatoes and peppers can be buried deeper. Never bury the crown (where stem meets roots) of herbs or flowers." },
      { step:"Fill, firm, and water", desc:"Fill gaps with fresh potting mix, press gently to remove air pockets (don't compact), then water slowly and thoroughly until drainage appears. No fertilizer for 2 weeks." },
      { step:"Recovery period", desc:"Keep out of direct sun for 2–4 days. Some wilting is completely normal — the plant is adjusting. As long as it perks up in the evening, it's doing fine." },
    ],
    aftercare:[
      "Check daily for the first week — wilting that recovers by evening is normal, wilting that doesn't recover means it needs water or more shade",
      "Hold off on fertilizing for 2 full weeks — fresh potting mix has enough nutrients and roots are too stressed to absorb more",
      "Resume normal watering schedule after the first week — but check more frequently than usual at first",
      "First signs of new growth (a new leaf unfurling) means the plant has successfully established — celebrate! 🎉",
    ],
    commonMistakes:[
      "Not watering before transplanting — biggest mistake beginners make",
      "Pulling by the stem — always support from the bottom",
      "Transplanting in midday heat — always morning or evening",
      "Fertilizing too soon — wait 2 full weeks",
      "Giving up during transplant shock — most plants look sad for 3–5 days and then bounce back completely",
    ],
  },
];

const WATERING_METHODS = [
  { id:"bottom", title:"Bottom Watering",        emoji:"🥛", badge:"⭐ Best for Milk Jugs",    badgeColor:"#43a047",
    desc:"Set jug in a tray with 1–2\" of water. Soil wicks up from below over 20–30 min. Encourages deep roots and keeps leaves dry.",
    steps:["Poke 4–6 drainage holes in the bottom of your jug","Set jug inside a shallow tray or second cut jug","Pour 1–2 inches of water into the tray","Let soak 20–30 min until top inch of soil feels moist","Remove and empty leftover tray water to prevent root rot"],
    tip:"Stick finger 1\" into soil after 30 min — still dry? Add more water to tray.",
    bestFor:["Milk Jug","Coffee Can","Plastic Pot","Yogurt Container"] },
  { id:"top",    title:"Top Watering",            emoji:"🚿", badge:"Good for Most Containers", badgeColor:"#1976d2",
    desc:"Pour slowly at base of plant until water drains from bottom holes. Best for larger containers.",
    steps:["Ensure container has drainage holes","Use watering can with gentle rose head","Aim at soil base — avoid wetting leaves","Water slowly until drainage from bottom holes","Wait until top 1–2\" dry before watering again"],
    tip:"Water in morning so leaves dry quickly. Avoid watering at night.",
    bestFor:["5-Gal Bucket","Fabric Bag","Plastic Pot"] },
  { id:"closedjug", title:"Closed Jug — No Finger Test", emoji:"🔒", badge:"Milk Jug Hack!", badgeColor:"#6d4c41",
    desc:"When your jug is mostly sealed (like a winterized cold-start jug), you can't stick your finger in the soil. Here's how to tell when to water without opening it.",
    steps:[
      "🏋️ Lift the jug — heavy means wet, light means dry. Learn your jug's 'thirsty weight' and water when it feels noticeably lighter",
      "👀 Watch the leaves — slight drooping or dullness in color means it's time. Don't wait until leaves are crispy!",
      "🌡️ Check the weather — if it's been hot and sunny for 2+ days with no rain, water even if unsure",
      "🕳️ Peek at the drainage holes — if the soil near the holes looks pale or cracked, it's dry",
      "📅 Keep a schedule — in Zone 8b, sealed jugs in summer usually need water every 1–2 days. In cooler months, every 3–5 days",
      "💧 When you do water, pour slowly through the cap hole or spout until you see a little drainage from the bottom holes",
    ],
    tip:"The lift test is the easiest habit to build — pick up your jug every morning. You'll quickly learn what 'needs water' feels like!",
    bestFor:["Milk Jug"] },
  { id:"self",   title:"DIY Self-Watering Jug",   emoji:"💡", badge:"Lazy Girl Approved 😄",    badgeColor:"#7b1fa2",
    desc:"Turn two milk jugs into a self-watering planter! Bottom jug = reservoir that wicks up to roots.",
    steps:["Cut one milk jug in half — top half is planter, bottom is reservoir","Poke hole in cap, thread cotton fabric strip as wick","Fill top half with potting mix, wick dangling below cap","Flip top half into bottom half like a funnel in a cup","Fill bottom reservoir through spout; top off every few days"],
    tip:"Use a strip of old cotton t-shirt as wick — works great!",
    bestFor:["Milk Jug"] },
];

const CALC_PLANTS = [
  { id:"basil",     label:"Basil",         emoji:"🌿", spacingIn:6,   rootDepthIn:6,  minVolGal:0.5,  notes:"Great in milk jugs & yogurt tubs" },
  { id:"mint",      label:"Mint",          emoji:"🌱", spacingIn:4,   rootDepthIn:6,  minVolGal:0.5,  notes:"Keep contained — spreads fast!" },
  { id:"chives",    label:"Chives",        emoji:"🌿", spacingIn:3,   rootDepthIn:6,  minVolGal:0.21, notes:"Perfect for coffee cans & cups" },
  { id:"parsley",   label:"Parsley",       emoji:"🫚", spacingIn:6,   rootDepthIn:8,  minVolGal:0.37, notes:"Needs depth — coffee can or tall jug" },
  { id:"cilantro",  label:"Cilantro",      emoji:"🌾", spacingIn:4,   rootDepthIn:6,  minVolGal:0.21, notes:"Bolt-resistant in cool weather — yogurt tub works great" },
  { id:"dill",      label:"Dill",          emoji:"🫛", spacingIn:6,   rootDepthIn:8,  minVolGal:0.5,  notes:"Gets tall — milk jug with top open is ideal" },
  { id:"greenonion",label:"Green Onions",  emoji:"🧅", spacingIn:2,   rootDepthIn:6,  minVolGal:0.21, notes:"Pack them in! A yogurt tub fits loads" },
  { id:"chamomile", label:"Chamomile",     emoji:"🫖", spacingIn:6,   rootDepthIn:6,  minVolGal:0.37, notes:"Easy from seed in a coffee can or yogurt tub" },
  { id:"lettuce",   label:"Lettuce",       emoji:"🥬", spacingIn:6,   rootDepthIn:6,  minVolGal:0.5,  notes:"Ideal for milk jugs — cut & come again" },
  { id:"spinach",   label:"Spinach",       emoji:"🥗", spacingIn:4,   rootDepthIn:6,  minVolGal:0.21, notes:"Shallow roots — great for wide trays" },
  { id:"radish",    label:"Radishes",      emoji:"🌱", spacingIn:3,   rootDepthIn:6,  minVolGal:0.21, notes:"Fast grower — great for cups & cans" },
  { id:"kale",      label:"Kale",          emoji:"🥬", spacingIn:12,  rootDepthIn:12, minVolGal:2,    notes:"Needs a 5-gal bucket for best results" },
  { id:"tomato",    label:"Tomato (Bush)", emoji:"🍅", spacingIn:18,  rootDepthIn:12, minVolGal:5,    notes:"5-gal bucket minimum — 1 plant per container" },
  { id:"pepper",    label:"Peppers",       emoji:"🫑", spacingIn:12,  rootDepthIn:10, minVolGal:2,    notes:"1 plant per milk jug (2-gal) works great!" },
  { id:"cucumber",  label:"Cucumbers",     emoji:"🥒", spacingIn:18,  rootDepthIn:12, minVolGal:5,    notes:"Needs vertical support — great in 5-gal buckets" },
  { id:"beans",     label:"Green Beans",   emoji:"🫘", spacingIn:4,   rootDepthIn:8,  minVolGal:1,    notes:"Bush variety best for containers" },
  { id:"strawberry",label:"Strawberries",  emoji:"🍓", spacingIn:8,   rootDepthIn:8,  minVolGal:1,    notes:"1 per jug or poke holes for a strawberry tower" },
  { id:"potato",     label:"Potatoes",      emoji:"🥔", spacingIn:12,  rootDepthIn:12, minVolGal:5,    notes:"Laundry basket or 5-gal bucket — hill soil up as vines grow for more potatoes!" },
  { id:"sweetpot",   label:"Sweet Potatoes",emoji:"🍠", spacingIn:18,  rootDepthIn:12, minVolGal:5,    notes:"One slip per 5-gal bucket — loves heat, great for Zone 8b spring planting" },
  { id:"carrot",    label:"Carrots",       emoji:"🥕", spacingIn:3,   rootDepthIn:12, minVolGal:1,    notes:"Need deep containers — 5-gal bucket ideal" },
  { id:"micro",     label:"Microgreens",   emoji:"🌱", spacingIn:0.5, rootDepthIn:2,  minVolGal:0.05, notes:"Perfect for seedling trays & plastic cups!" },
];

const CALC_CONTAINERS = [
  { id:"milkjug1", label:"1-Gal Milk Jug",   emoji:"🥛", volGal:1,    diamIn:5,  depthIn:9  },
  { id:"milkjug2", label:"2-Gal Milk Jug",   emoji:"🥛", volGal:2,    diamIn:6,  depthIn:11 },
  { id:"cup8oz",   label:"8oz Cup",           emoji:"🥤", volGal:0.05, diamIn:3,  depthIn:3  },
  { id:"cup16oz",  label:"16oz Cup",          emoji:"🥤", volGal:0.1,  diamIn:4,  depthIn:4  },
  { id:"yogurt32", label:"32oz Yogurt Tub",   emoji:"🫙", volGal:0.21, diamIn:5,  depthIn:5  },
  { id:"can3lb",   label:"3lb Coffee Can",    emoji:"🥫", volGal:0.37, diamIn:6,  depthIn:7  },
  { id:"pot3gal",  label:"3-Gal Pot",         emoji:"🪴", volGal:3,    diamIn:10, depthIn:10 },
  { id:"pot5gal",  label:"5-Gal Bucket",      emoji:"🪣", volGal:5,    diamIn:12, depthIn:12 },
  { id:"basket",    label:"Laundry Basket", emoji:"🧺", volGal:10,   diamIn:16, depthIn:12 },
  { id:"fabric7",  label:"7-Gal Fabric Bag",  emoji:"👜", volGal:7,    diamIn:14, depthIn:13 },
  { id:"custom",   label:"Custom Size",       emoji:"✏️", volGal:null, diamIn:null,depthIn:null },
];

function getWateringRange(waterEvery, zone, container) {
  const zn = zone ? parseFloat(zone.zone) : null;
  const zm = zn === null ? 1 : zn <= 3 ? 1.6 : zn <= 5 ? 1.3 : zn <= 7 ? 1.0 : zn <= 9 ? 0.75 : 0.55;
  const cm = container === "Fabric Bag" ? 0.65 : container === "Coffee Can" ? 0.85 : container === "5-Gal Bucket" ? 1.1 : 0.9;
  const adj = waterEvery * zm * cm;
  const min = Math.max(1, Math.round(adj * 0.75));
  const max = Math.max(min + 1, Math.round(adj * 1.25));
  return { min, max };
}

function wLabel(r) { return r.min === r.max ? `every ${r.min}d` : `every ${r.min}–${r.max}d`; }

const CONTAINER_WATERING_ADVICE = {
  "Mason Jar":        { method:"Tiny careful pours only", amount:"~2–3 tbsp", howTo:"Mason jars have zero drainage so overwatering is a real risk! Use a turkey baster or small spoon to add just 2–3 tbsp at a time. Let the soil dry out between waterings. Add a layer of pebbles at the bottom to help with moisture control.", checkMethod:"👆 Finger test the very top — even slightly damp means wait. When in doubt, skip a day.", icon:"🫙" },
  "Milk Jug":         { method:"Lift test + pour through top", amount:"~1–2 cups", howTo:"Pick up the jug daily — when it feels noticeably lighter, it's time. Pour slowly through the opening until you see a few drops from the drainage holes. If your jug is sealed, watch for slight leaf droop as your other signal.", checkMethod:"🏋️ Lift test — light jug = thirsty", icon:"🥛" },
  "Yogurt Container": { method:"Bottom watering or gentle top", amount:"~½ cup", howTo:"Set in a shallow dish with ½\" of water and let it soak up for 15–20 min. These small containers dry out fast — check daily in warm weather. Finger test is easy here: just poke through the top.", checkMethod:"👆 Finger test — these are small enough!", icon:"🫙" },
  "Coffee Can":       { method:"Top water slowly", amount:"~1 cup", howTo:"Water slowly at the base until you see drainage from the bottom holes. Coffee cans hold moisture well but can get waterlogged — make sure drainage holes are clear. Finger test 1\" deep before each watering.", checkMethod:"👆 Finger test 1\" deep before watering", icon:"🥫" },
  "5-Gal Bucket":     { method:"Deep top watering", amount:"~1 gallon", howTo:"Water deeply and slowly until it drains from the bottom. Big containers hold moisture longer — don't water again until the top 2\" feel dry. Stick your whole finger in to check. In summer heat, check every day even if you don't water.", checkMethod:"👆 Finger test 2\" deep — bigger pot, deeper check", icon:"🪣" },
  "Plastic Pot":      { method:"Top water or bottom soak", amount:"~2–3 cups", howTo:"Water until it drains from the bottom, or set in a tray with 1\" of water for 20 min. Plastic retains moisture well — always finger-test before watering to avoid overwatering. Lift the pot too — heavy means wet!", checkMethod:"👆 Finger test + 🏋️ lift test", icon:"🪴" },
  "Fabric Bag":       { method:"Top water thoroughly", amount:"~2–4 cups", howTo:"Fabric bags breathe and dry out FAST — water more often than you think! Pour slowly around the whole surface until you see drainage. In hot weather these may need water every day. Squeeze the side of the bag — if it feels stiff and dry, water now.", checkMethod:"🤏 Squeeze the bag side — stiff & dry = water now", icon:"👜" },
  "Egg Carton":       { method:"Mist only", amount:"A few sprays per cell", howTo:"Egg cartons absorb water fast and can get soggy. Use a spray bottle and mist each cell lightly. Keep barely moist — not wet. Sit the carton in a tray to catch any drips and keep humidity up.", checkMethod:"👆 Touch the surface — damp = wait, dry & pulling away = mist now", icon:"🥚" },
  "Takeout Tray":     { method:"Gentle pour or mist", amount:"~¼ cup at a time", howTo:"Poke drainage holes first if you haven't! These are shallow so they dry out fast. Water gently — too much at once and you'll wash seeds around. Check twice a day in warm weather.", checkMethod:"👆 Finger test the center — edges dry first but roots need moisture in the middle", icon:"🥡" },
  "Cardboard Box":    { method:"Slow even watering", amount:"Varies by size", howTo:"Water slowly and evenly across the whole surface. Cardboard absorbs water and will eventually break down — that's totally fine for in-ground planting! Check daily as it can dry unevenly. Line with plastic if you want it to last longer.", checkMethod:"🏋️ Lift test + finger test. Cardboard loses water through the sides too", icon:"📦" },
  "Solo Cup":         { method:"Small pours only", amount:"~2–3 tbsp", howTo:"Poke 3–4 holes in the bottom first if you haven't. The small volume dries out very fast — check daily in warm weather. Water slowly so it soaks in rather than running off the sides.", checkMethod:"👆 Finger test just ½\" deep — these are very shallow!", icon:"🥤" },
  "Plastic Bottle":   { method:"Small pours or self-watering setup", amount:"~¼ cup", howTo:"For a self-watering setup: cut in half, flip the top into the bottom with a wick, fill the bottom as a reservoir. Otherwise poke drainage holes and water ~¼ cup at a time. Lift test works great — bottles are light!", checkMethod:"🏋️ Lift test — bottles are light so you feel the difference easily", icon:"🍶" },
  "Tin Can":          { method:"Small careful pours", amount:"~¼–½ cup", howTo:"Poke several holes in the bottom with a nail first — tin cans have NO drainage otherwise! Metal heats up fast so check moisture twice a day in summer. Water in the morning before the can heats up.", checkMethod:"🌡️ Check if the can is hot to touch — if so, soil is drying fast. Finger test 1\" deep", icon:"🥫" },
  "Newspaper Pot":    { method:"Bottom watering or misting only", amount:"A few sprays or short soak", howTo:"Newspaper falls apart when soaked from above — use a spray bottle or set the pot in a tray with ½\" of water for 10 min to absorb from below. Keep just barely moist. Plant the whole pot when transplanting!", checkMethod:"👆 Very gentle surface touch. Soggy newspaper = skip watering", icon:"📰" },
  "Laundry Basket":   { method:"Deep top watering", amount:"~1–2 gallons", howTo:"Works like a fabric bag — breathes on all sides and dries out fast. Line with burlap or landscape fabric first to hold soil in. Water deeply until you see drainage from the bottom. Check daily in summer.", checkMethod:"🤏 Squeeze the side — stiff & dry = water now", icon:"🧺" },
  "Colander":         { method:"Top water until it runs through", amount:"~2–4 cups", howTo:"Colanders drain extremely fast from all sides — line with burlap or newspaper first to hold soil in. Water slowly until it runs through. These dry out faster than regular pots so check often.", checkMethod:"👆 Finger test 1\" deep. Colanders dry faster than regular pots!", icon:"🪣" },
  "Custom Container": { method:"Depends on your container", amount:"Start small and watch drainage", howTo:"Every custom container is different! The golden rules: always have drainage holes in the bottom, start with a small amount of water and check for drainage, and always finger-test before watering again.", checkMethod:"👆 Finger test 1\" deep before every watering. When in doubt, wait a day", icon:"📦" },
};

const SOIL_TYPES = {
  potting:   { name:"Potting Mix",           emoji:"🪴", color:"#e8f5e9", tc:"#2e7d32", desc:"All-purpose container soil. Lightweight, well-draining, and full of nutrients. The go-to for most container plants.", avoid:"Never use garden soil in containers — it compacts, drains poorly, and can bring pests and disease.", brands:"Look for: Miracle-Gro Potting Mix, Fox Farm Happy Frog, Espoma Organic." },
  seedStart: { name:"Seed Starting Mix",     emoji:"🌱", color:"#e3f2fd", tc:"#1565c0", desc:"Fine, sterile, and light. Designed for germination — no big chunks that block tiny roots. Low nutrients by design since seedlings don't need much at first.", avoid:"Don't use regular potting mix for seeds — it's too dense and can crust over, blocking sprouts.", brands:"Look for: Jiffy Seed Starting Mix, Burpee Organic Seed Starting Formula." },
  cactus:    { name:"Cactus & Succulent Mix",emoji:"🌵", color:"#fff9c4", tc:"#f57f17", desc:"Sandy, fast-draining mix. Perfect for herbs that hate wet roots like rosemary, thyme, lavender, and oregano. Mix with perlite for extra drainage.", avoid:"Don't use moisture-control or water-retaining mixes for drought-tolerant herbs — root rot will follow.", brands:"Look for: Miracle-Gro Cactus Mix, Espoma Cactus Mix. Or mix 50% potting mix + 50% perlite." },
  moisture:  { name:"Moisture Control Mix",  emoji:"💧", color:"#e1f5fe", tc:"#0277bd", desc:"Contains water-retaining crystals or coconut coir. Stays moist longer — great for thirsty plants like lettuce, spinach, and strawberries.", avoid:"Don't use for herbs that like to dry out (rosemary, thyme, lavender) — they'll get root rot.", brands:"Look for: Miracle-Gro Moisture Control, Coast of Maine Sprout Island." },
  compost:   { name:"Compost Amendment",     emoji:"🌿", color:"#f1f8e9", tc:"#33691e", desc:"Not a standalone soil — mix into potting mix at about 20–30% to boost nutrients. Great for heavy feeders like tomatoes, peppers, and potatoes.", avoid:"Don't use pure compost in containers — it compacts and holds too much moisture.", brands:"Look for: Black Kow Composted Manure, Espoma Bio-tone Starter. Or make your own!" },
  perlite:   { name:"Perlite (amendment)",   emoji:"⚪", color:"#f5f5f5", tc:"#757575", desc:"White volcanic glass granules. Mix into any potting soil to improve drainage and aeration — especially helpful for containers that tend to stay too wet.", avoid:"Not a standalone soil — always mix with potting mix.", brands:"Available at any garden center. Mix at about 20–30% of total soil volume." },
};

// What soil type each plant needs
const PLANT_SOIL_MAP = {
  basil:"potting", mint:"potting", chives:"potting", parsley:"potting",
  cilantro:"potting", dill:"potting", greenonion:"potting", chamomile:"potting",
  lettuce:"moisture", spinach:"moisture", kale:"potting", radish:"potting",
  tomato:"compost", pepper:"compost", cucumber:"compost", beans:"potting",
  strawberry:"potting", potato:"compost", sweetpot:"potting", carrot:"potting",
  micro:"seedStart",
  // indoor guides by name
  Basil:"potting", Mint:"potting", Chives:"potting", Parsley:"potting",
  Cilantro:"potting", Dill:"potting", Thyme:"cactus", Rosemary:"cactus",
  Oregano:"cactus", "Lemon Balm":"potting", Lavender:"cactus",
  Microgreens:"seedStart", "Green Onions":"potting",
};

// What soil type each container calls for
const CONTAINER_SOIL_MAP = {
  "Egg Carton":"seedStart", "Takeout Tray":"seedStart", "Newspaper Pot":"seedStart",
  "Solo Cup":"seedStart", "Milk Jug":"potting", "Yogurt Container":"potting",
  "Coffee Can":"potting", "Mason Jar":"potting", "Plastic Bottle":"potting",
  "Tin Can":"potting", "Plastic Pot":"potting", "5-Gal Bucket":"compost",
  "Fabric Bag":"compost", "Laundry Basket":"compost", "Colander":"potting",
  "Cardboard Box":"potting", "Custom Container":"potting",
};

function getSoilRec(plantId, plantName, container) {
  const byPlant = PLANT_SOIL_MAP[plantId] || PLANT_SOIL_MAP[plantName];
  const byCont  = CONTAINER_SOIL_MAP[container];
  if (byCont === "seedStart") return SOIL_TYPES.seedStart;
  if (byPlant === "cactus") return SOIL_TYPES.cactus;
  if (byPlant === "compost" && byCont === "compost") return { ...SOIL_TYPES.compost, name:"Potting Mix + Compost", desc:"Use 70% quality potting mix + 30% compost. Heavy feeders in large containers thrive with this combo. Re-fertilize every 4–6 weeks through the season." };
  if (byPlant === "moisture") return SOIL_TYPES.moisture;
  return SOIL_TYPES.potting;
}

function getTS(plant, days) {
  const td = TRANSPLANT_MAP[plant.container] || { next:"Larger Container", nextVol:"2× current", daysMin:30, daysMax:45 };
  const checked = plant.transplantSigns || [];

  const hasLeaves2  = checked.includes("leaves2");
  const hasLeaves3  = checked.includes("leaves3");
  const hasRoots    = checked.includes("roots");
  const hasDroop    = checked.includes("droop");
  const hasRootball = checked.includes("rootball");

  // True leaves are the primary signal
  // Urgent: 3+ true leaves OR roots out OR wilting despite watering OR past deadline
  const urgent = hasLeaves3 || hasRoots || (hasDroop && hasLeaves2) || days >= td.daysMax;
  // Ready: 2 true leaves + any supporting sign, OR rootball holds shape, OR past min days with any sign
  const ready  = !urgent && (
    (hasLeaves2 && (hasRoots || hasRootball || hasDroop || checked.length >= 2)) ||
    hasRootball ||
    (days >= td.daysMin && checked.length >= 1)
  );
  // Watch: 2 true leaves alone, or past min days
  const watch  = !urgent && !ready && (hasLeaves2 || days >= td.daysMin);

  const urgency = urgent ? "urgent" : ready ? "ready" : watch ? "watch" : "growing";
  return { ...td, urgency, checkedCount: checked.length };
}

function calcFit(cont, plant, cVol, cDiam, cDepth) {
  let vol = cont.volGal, diam = cont.diamIn, depth = cont.depthIn;
  if (cont.id === "custom") {
    vol = parseFloat(cVol) || 0;
    diam = parseFloat(cDiam) || 0;
    depth = parseFloat(cDepth) || 0;
    if (!vol && diam && depth) vol = Math.PI * (diam/2)**2 * depth / 231;
  }
  if (!vol || !depth || !diam) return null;
  const tooShallow = depth < plant.rootDepthIn;
  const tooSmall   = vol   < plant.minVolGal;
  const count = tooShallow || tooSmall ? 0 : Math.max(1, Math.floor(((diam-1)/plant.spacingIn)**2 * 0.7));
  return { count, soilCups: Math.round(vol*4*0.85*4*10)/10, soilCuFt: Math.round(vol*0.134*0.85*10)/10, tooShallow, tooSmall, vol: Math.round(vol*10)/10, depth };
}

const UR = {
  urgent:{ bg:"#fff3e0", border:"#ff9800", color:"#ff6f00", label:"🚨 Transplant now!" },
  ready: { bg:"#fffde7", border:"#fdd835", color:"#f9a825", label:"🪴 Ready to transplant" },
  watch: { bg:"#f9fbe7", border:"#aed581", color:"#689f38", label:"👀 Watch for signs" },
  growing:{ bg:"#e8f5e9",border:"#a5d6a7", color:"#388e3c", label:"🌱 Growing" },
};

const card = { background:"#fff", borderRadius:16, padding:13, marginBottom:10, boxShadow:"0 2px 10px #0001" };
const btn  = (bg, c="#fff", extra={}) => ({ background:bg, color:c, border:"none", borderRadius:11, padding:"9px 14px", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit", ...extra });
const badge= (bg, c) => ({ background:bg, color:c, borderRadius:8, padding:"2px 7px", fontSize:10, fontWeight:700, display:"inline-block" });

// ── ZIP → ZONE LOOKUP ──
function guessZoneFromZip(zip) {
  const n = parseInt(zip, 10);
  const zoneKey =
    n >= 99500 && n <= 99999 ? "1a"  :
    n >= 96700 && n <= 96899 ? "11a" :
    n >= 33000 && n <= 34999 ? "9b"  :
    n >= 32000 && n <= 32999 ? "8b"  :
    n >= 30000 && n <= 31999 ? "7b"  :
    n >= 35000 && n <= 36999 ? "7a"  :
    n >= 37000 && n <= 38599 ? "6b"  :
    n >= 39000 && n <= 39799 ? "7b"  :
    n >= 70000 && n <= 71599 ? "8a"  :
    n >= 75000 && n <= 79999 ? "7a"  :
    n >= 85000 && n <= 86599 ? "9a"  :
    n >= 90000 && n <= 93599 ? "9b"  :
    n >= 94000 && n <= 96199 ? "9a"  :
    n >= 97000 && n <= 97999 ? "8a"  :
    n >= 98000 && n <= 99499 ? "8b"  :
    n >= 59000 && n <= 59999 ? "4a"  :
    n >= 80000 && n <= 81699 ? "5b"  :
    n >= 82000 && n <= 83199 ? "4b"  :
    n >= 83200 && n <= 83999 ? "5a"  :
    n >= 84000 && n <= 84799 ? "6a"  :
    n >= 87000 && n <= 88499 ? "6b"  :
    n >= 89000 && n <= 89899 ? "8b"  :
    n >= 55000 && n <= 56799 ? "4a"  :
    n >= 53000 && n <= 54999 ? "5a"  :
    n >= 60000 && n <= 62999 ? "5b"  :
    n >= 46000 && n <= 47999 ? "5b"  :
    n >= 43000 && n <= 45999 ? "5b"  :
    n >= 48000 && n <= 49999 ? "5a"  :
    n >= 40000 && n <= 42799 ? "6a"  :
    n >= 24000 && n <= 26899 ? "6a"  :
    n >= 15000 && n <= 19699 ? "6a"  :
    n >= 10000 && n <= 14999 ? "6a"  :
    n >= 6000  && n <= 6999  ? "6b"  :
    n >= 1000  && n <= 2799  ? "6a"  :
    n >= 7000  && n <= 8999  ? "6b"  :
    n >= 19700 && n <= 19999 ? "7a"  :
    n >= 20000 && n <= 21999 ? "7a"  :
    n >= 23000 && n <= 23999 ? "7a"  :
    n >= 27000 && n <= 28999 ? "7b"  :
    n >= 29000 && n <= 29999 ? "8a"  :
    n >= 57000 && n <= 57999 ? "4b"  :
    n >= 58000 && n <= 58999 ? "4a"  :
    n >= 68000 && n <= 69999 ? "5a"  :
    n >= 66000 && n <= 67999 ? "5b"  :
    n >= 63000 && n <= 65999 ? "6a"  :
    n >= 71600 && n <= 72999 ? "7a"  :
    n >= 73000 && n <= 74999 ? "6b"  :
    n >= 50000 && n <= 52999 ? "5a"  :
    "5b";
  return ZONES.find(z => z.zone === zoneKey) || null;
}

// ── AUTO DETECT ZONE COMPONENT ──
function AutoDetectZone({ onDetected }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error

  const detect = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          if (!res.ok) throw new Error("Geocode failed");
          const data = await res.json();
          const zip = (data.address?.postcode || "").replace(/\D/g, "").slice(0, 5);
          if (!zip || zip.length < 5) throw new Error("No zip");
          const zone = guessZoneFromZip(zip);
          if (zone) {
            onDetected(zone);
          } else {
            setStatus("error");
          }
        } catch {
          setStatus("error");
        }
      },
      () => setStatus("error"),
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  if (status === "loading") {
    return (
      <div style={{ fontSize:11, color:"#666", background:"#e8f5e9", borderRadius:8, padding:"6px 12px", display:"inline-block", marginTop:6 }}>
        📍 Detecting your location…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ fontSize:10, color:"#c62828", background:"#ffebee", borderRadius:8, padding:"5px 12px", display:"inline-block", marginTop:6 }}>
        Couldn't detect automatically — pick your zone from the list below!
      </div>
    );
  }

  return (
    <button
      onClick={detect}
      style={{
        background:"linear-gradient(135deg,#43a047,#66bb6a)",
        color:"#fff", border:"none", borderRadius:10,
        padding:"7px 16px", fontWeight:800, fontSize:12,
        cursor:"pointer", fontFamily:"inherit", marginTop:6,
        boxShadow:"0 2px 8px #43a04740"
      }}
    >
      📍 Auto-detect my zone
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("garden");
  const [showSplash, setShowSplash] = useState(() => localStorage.getItem('lazysprout_splashSeen') === null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); setShowInstallBanner(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') { setShowInstallBanner(false); setInstallPrompt(null); }
  };

  const [onboarding, setOnboarding] = useState(() => localStorage.getItem('lazysprout_myZone') === null);
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [myZone,  setMyZone]  = useState(() => { const s = localStorage.getItem('lazysprout_myZone');  return s ? JSON.parse(s) : null; });
  const [plants,  setPlants]  = useState(() => { const s = localStorage.getItem('lazysprout_plants');  return s ? JSON.parse(s) : [];   });

  const [selectedPlant,    setSelectedPlant]    = useState(null);
  const [showAdd,          setShowAdd]          = useState(false);
  const [newPlant,         setNewPlant]         = useState({ name:"", container:"Milk Jug", waterEvery:2, emoji:"🪴", notes:"", plantedDate:TODAY, indoor:false, sproutMin:7, sproutMax:14, jugNumber:"" });
  const [guidesTab,        setGuidesTab]        = useState("indoor");
  const [selectedGuide,    setSelectedGuide]    = useState(null);
  const [selectedWatering, setSelectedWatering] = useState(null);
  const [selectedTrouble,  setSelectedTrouble]  = useState(null);
  const [showTransplantPro, setShowTransplantPro] = useState(false);
  const [congratsPlant, setCongratsPlant] = useState(null);
  const [newProgressNote, setNewProgressNote] = useState("");
  const [newProgressMood, setNewProgressMood] = useState("🌱");
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [sproutCelebration, setSproutCelebration] = useState(null);

  const markSprouted = (id) => {
    const plant = plants.find(p => p.id === id);
    setPlants(ps => ps.map(p => p.id !== id ? p : {
      ...p,
      sproutedDate: TODAY,
      health: Math.min(100, p.health + 20),
      progressLog: [...(p.progressLog || []), {
        id: Date.now(),
        date: TODAY,
        note: `🌱 First sprout spotted! Day ${daysSince(p.planted)} after planting.`,
        mood: "🎉",
        day: daysSince(p.planted),
      }]
    }));
    setSproutCelebration(plant);
  };
  const [zoneDetail,       setZoneDetail]       = useState(null);
  const [calcCont,         setCalcCont]         = useState(null);
  const [calcPlant,        setCalcPlant]        = useState(null);
  const [cVol,  setCVol]  = useState(""); const [cDiam, setCDiam] = useState(""); const [cDepth, setCDepth] = useState("");
  const [custPlantMode, setCustPlantMode] = useState(false);
  const [cpName, setCpName] = useState(""); const [cpSpacing, setCpSpacing] = useState(""); const [cpDepth, setCpDepth] = useState(""); const [cpMinVol, setCpMinVol] = useState("");
  const [showAllCalc, setShowAllCalc] = useState(false);

  useEffect(() => { localStorage.setItem('lazysprout_plants',  JSON.stringify(plants));  }, [plants]);
  useEffect(() => { localStorage.setItem('lazysprout_myZone',  JSON.stringify(myZone));  }, [myZone]);

  const waterPlant    = id => setPlants(ps => ps.map(p => p.id === id ? { ...p, lastWatered:TODAY, health:Math.min(100,p.health+15) } : p));
  const toggleSign    = (pid, sid) => setPlants(ps => ps.map(p => { if (p.id!==pid) return p; const s=p.transplantSigns||[]; return { ...p, transplantSigns: s.includes(sid)?s.filter(x=>x!==sid):[...s,sid] }; }));
  const addProgressNote = (plantId, note, mood) => {
    if (!note.trim()) return;
    const entry = { id: Date.now(), date: TODAY, note: note.trim(), mood, day: daysSince(plants.find(p => p.id === plantId)?.planted || TODAY) };
    setPlants(ps => ps.map(p => p.id !== plantId ? p : { ...p, progressLog: [...(p.progressLog || []), entry] }));
    setNewProgressNote("");
    setNewProgressMood("🌱");
    setShowProgressForm(false);
  };
  const deleteProgressNote = (plantId, noteId) => {
    setPlants(ps => ps.map(p => p.id !== plantId ? p : { ...p, progressLog: (p.progressLog || []).filter(n => n.id !== noteId) }));
  };
  const markTransplanted = id => {
    const plant = plants.find(p => p.id === id);
    setPlants(ps => ps.map(p => p.id!==id ? p : { ...p, planted:TODAY, transplantSigns:[], health:Math.min(100,p.health+10), notes:(p.notes?p.notes+" · ":"")+"Transplanted!" }));
    setSelectedPlant(null);
    setCongratsPlant(plant);
  };
  const deletePlant   = id => { setPlants(ps => ps.filter(p => p.id !== id)); setSelectedPlant(null); };
  const addPlant      = () => {
    if (!newPlant.name.trim()) return;
    setPlants(ps => [...ps, { ...newPlant, id:Date.now(), planted:newPlant.plantedDate||TODAY, lastWatered:TODAY, health:100, transplantSigns:[] }]);
    setNewPlant({ name:"", container:"Milk Jug", waterEvery:2, emoji:"🪴", notes:"", plantedDate:TODAY, indoor:false, sproutMin:7, sproutMax:14, jugNumber:"" });
    setShowAdd(false);
  };

  const thirstyCount    = plants.filter(p => daysSince(p.lastWatered) >= p.waterEvery).length;
  const transplantReady = plants.filter(p => { const ts=getTS(p,daysSince(p.planted)); return ts.urgency==="ready"||ts.urgency==="urgent"; });

  const zoneNames      = myZone ? myZone.plants.map(n => n.toLowerCase()) : [];
  const zonePlants     = myZone ? CALC_PLANTS.filter(p => zoneNames.some(z => p.label.toLowerCase().includes(z.split(" ")[0]) || z.includes(p.label.toLowerCase().split(" ")[0]))) : [];
  const otherCalcPlants= myZone ? CALC_PLANTS.filter(p => !zonePlants.includes(p)) : CALC_PLANTS;
  const activePlant    = custPlantMode
    ? { id:"custom", label:cpName||"My Plant", emoji:"🌱", spacingIn:parseFloat(cpSpacing)||0, rootDepthIn:parseFloat(cpDepth)||0, minVolGal:parseFloat(cpMinVol)||0, notes:"Custom plant — check seed packet." }
    : calcPlant;
  const calcResult = calcCont && activePlant ? calcFit(calcCont, activePlant, cVol, cDiam, cDepth) : null;

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() };
  });
  const [calendarDay, setCalendarDay] = useState(null);

  const getCalendarEvents = () => {
    const events = {};
    const addEvent = (dateStr, ev) => { if (!events[dateStr]) events[dateStr] = []; events[dateStr].push(ev); };
    plants.forEach(p => {
      const lastW = new Date(p.lastWatered);
      for (let i = 0; i < 45; i++) {
        const d = new Date(lastW); d.setDate(d.getDate() + p.waterEvery * (i + 1));
        addEvent(d.toISOString().split("T")[0], { type:"water", emoji:p.emoji, name:p.name, id:p.id });
      }
      const td = TRANSPLANT_MAP[p.container];
      if (td) {
        const pd = new Date(p.planted);
        const mn = new Date(pd); mn.setDate(mn.getDate() + td.daysMin);
        const mx = new Date(pd); mx.setDate(mx.getDate() + td.daysMax);
        addEvent(mn.toISOString().split("T")[0], { type:"transplant", emoji:p.emoji, name:p.name, label:"Transplant window opens", id:p.id });
        addEvent(mx.toISOString().split("T")[0], { type:"transplant_end", emoji:p.emoji, name:p.name, label:"Transplant deadline", id:p.id });
      }
      addEvent(p.planted, { type:"planted", emoji:p.emoji, name:p.name, label:"Planted!", id:p.id });
    });
    return events;
  };
  const calendarEvents = getCalendarEvents();
  const thirstyToday = plants.filter(p => daysSince(p.lastWatered) >= p.waterEvery);
  const transplantToday = plants.filter(p => { const ts=getTS(p,daysSince(p.planted)); return ts.urgency==="ready"||ts.urgency==="urgent"; });

  return (
    <div style={{ fontFamily:"'Quicksand',sans-serif", background:"linear-gradient(135deg,#fffde7,#e8f5e9,#e3f2fd)", minHeight:"100vh", maxWidth:480, margin:"0 auto", position:"relative" }}>

      {/* ── SPLASH SCREEN ── */}
      {showSplash && (
        <div style={{ position:"fixed", inset:0, zIndex:500, maxWidth:480, margin:"0 auto", overflow:"hidden" }}>
          <style>{`
            @keyframes lgFadeIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
            @keyframes lgPop { 0%{transform:scale(0.4) rotate(-10deg);opacity:0} 65%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
            @keyframes lgFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(5deg)} }
            @keyframes lgFloat2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-4deg)} }
            @keyframes lgBarGrow { from{width:0} to{width:100%} }
            @keyframes lgFadeOut { from{opacity:1} to{opacity:0;pointer-events:none} }
            @keyframes lgShimmer { 0%,100%{opacity:0.3} 50%{opacity:1} }
            .lg-splash-ready .lg-logo { animation: lgPop 1s cubic-bezier(.36,.07,.19,.97) 0.2s both; }
            .lg-splash-ready .lg-title { animation: lgFadeIn 0.9s ease 0.9s both; }
            .lg-splash-ready .lg-sub { animation: lgFadeIn 0.9s ease 1.5s both; }
            .lg-splash-ready .lg-tagline { animation: lgFadeIn 0.9s ease 1.9s both; }
            .lg-splash-ready .lg-bar { animation: lgFadeIn 0.6s ease 2.4s both; }
            .lg-splash-ready .lg-skip { animation: lgFadeIn 0.6s ease 3.2s both; }
            .lg-splash-ready .lg-dots { animation: lgFadeIn 0.6s ease 2.6s both; }
            .lg-splash-ready.lg-do-exit { animation: lgFadeOut 0.8s ease both; }
            .lg-splash-ready .lg-bar-fill { animation: lgBarGrow 3s cubic-bezier(0.4,0,0.2,1) 2.4s both; }
            .lg-logo { opacity:0; }
            .lg-title { opacity:0; }
            .lg-sub { opacity:0; }
            .lg-tagline { opacity:0; }
            .lg-bar { opacity:0; }
            .lg-skip { opacity:0; }
            .lg-dots { opacity:0; }
            .lg-p1 { animation: lgFloat  3.8s ease-in-out 0.2s infinite; position:absolute; }
            .lg-p2 { animation: lgFloat2 3.4s ease-in-out 0.5s infinite; position:absolute; }
            .lg-p3 { animation: lgFloat  4.1s ease-in-out 0.0s infinite; position:absolute; }
            .lg-p4 { animation: lgFloat2 3.6s ease-in-out 0.8s infinite; position:absolute; }
            .lg-p5 { animation: lgFloat  3.2s ease-in-out 1.1s infinite; position:absolute; }
            .lg-p6 { animation: lgFloat2 3.9s ease-in-out 0.3s infinite; position:absolute; }
            .lg-dot { animation: lgShimmer 1.6s ease-in-out infinite; display:inline-block; width:7px; height:7px; background:rgba(255,255,255,0.5); border-radius:50%; margin:0 3px; }
            .lg-dot:nth-child(2){animation-delay:0.3s} .lg-dot:nth-child(3){animation-delay:0.6s}
          `}</style>
          <div id="lg-splash-root"
            style={{ width:"100%", height:"100%", background:"linear-gradient(160deg,#1b5e20 0%,#2e7d32 45%,#33691e 75%,#1b5e20 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative" }}>

            {/* Background circles */}
            <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", background:"rgba(255,255,255,0.03)", top:-80, right:-80 }} />
            <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.03)", bottom:-60, left:-60 }} />
            <div style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.04)", top:"30%", left:-40 }} />

            {/* Floating plants */}
            <span className="lg-p1" style={{ top:"8%",  left:"6%",  fontSize:32 }}>🍅</span>
            <span className="lg-p2" style={{ top:"12%", right:"8%", fontSize:26 }}>🌿</span>
            <span className="lg-p3" style={{ top:"42%", left:"4%",  fontSize:28 }}>🥬</span>
            <span className="lg-p4" style={{ top:"38%", right:"5%", fontSize:24 }}>🫑</span>
            <span className="lg-p5" style={{ bottom:"18%",left:"8%",  fontSize:26 }}>🥒</span>
            <span className="lg-p6" style={{ bottom:"14%",right:"7%", fontSize:30 }}>🌱</span>

            {/* Sprout illustration */}
            <div className="lg-logo" style={{ marginBottom:4, width:"100%", maxWidth:320 }}>
              <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
                <style>{`
                  @keyframes lgsway { 0%,100%{transform-origin:340px 340px;transform:rotate(-2deg)} 50%{transform-origin:340px 340px;transform:rotate(2deg)} }
                  @keyframes lgleafL { 0%,100%{transform-origin:325px 280px;transform:rotate(-5deg)} 50%{transform-origin:325px 280px;transform:rotate(3deg)} }
                  @keyframes lgleafR { 0%,100%{transform-origin:355px 270px;transform:rotate(5deg)} 50%{transform-origin:355px 270px;transform:rotate(-3deg)} }
                  @keyframes lgdrop { 0%{opacity:0;transform:translateY(0)} 60%{opacity:1} 100%{opacity:0;transform:translateY(18px)} }
                  .lgstem { animation: lgsway 3.5s ease-in-out infinite; }
                  .lgleafl { animation: lgleafL 3.5s ease-in-out infinite; }
                  .lgleafr { animation: lgleafR 3.5s ease-in-out 0.4s infinite; }
                  .lgdrop1 { animation: lgdrop 2.2s ease-in 0.3s infinite; }
                  .lgdrop2 { animation: lgdrop 2.2s ease-in 1.1s infinite; }
                `}</style>
                <rect x="0" y="0" width="680" height="420" fill="none"/>
                <ellipse cx="340" cy="370" rx="180" ry="22" fill="#5d4037"/>
                <ellipse cx="340" cy="362" rx="170" ry="16" fill="#6d4c41"/>
                <rect x="268" y="295" width="144" height="80" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M412 305 Q445 305 445 330 Q445 355 412 355" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round"/>
                <rect x="310" y="272" width="60" height="28" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <rect x="318" y="258" width="44" height="18" rx="5" fill="#a5d6a7" stroke="#c8e6c9" strokeWidth="2"/>
                <rect x="268" y="340" width="144" height="35" fill="#5d4037"/>
                <ellipse cx="340" cy="340" rx="72" ry="8" fill="#6d4c41"/>
                <g className="lgstem">
                  <path d="M340 338 Q337 310 336 280 Q335 250 340 220" fill="none" stroke="#a5d6a7" strokeWidth="5" strokeLinecap="round"/>
                  <g className="lgleafl">
                    <path d="M336 280 Q305 255 298 228 Q318 238 332 262 Q334 272 336 280Z" fill="#c8e6c9"/>
                    <path d="M336 280 Q316 247 310 230" fill="none" stroke="#a5d6a7" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                  <g className="lgleafr">
                    <path d="M338 270 Q372 240 382 212 Q360 225 345 252 Q341 261 338 270Z" fill="#e8f5e9"/>
                    <path d="M338 270 Q362 238 374 218" fill="none" stroke="#c8e6c9" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                  <ellipse cx="340" cy="218" rx="8" ry="11" fill="#a5d6a7" transform="rotate(-5 340 218)"/>
                  <ellipse cx="340" cy="213" rx="5" ry="7" fill="#e8f5e9" transform="rotate(-5 340 213)"/>
                </g>
                <ellipse className="lgdrop1" cx="292" cy="292" rx="4" ry="6" fill="rgba(255,255,255,0.6)"/>
                <ellipse className="lgdrop2" cx="384" cy="298" rx="3" ry="5" fill="rgba(255,255,255,0.5)"/>
                <path d="M190 368 Q188 350 190 335" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round"/>
                <path d="M190 350 Q175 338 170 325 Q183 332 190 348Z" fill="rgba(255,255,255,0.2)"/>
                <path d="M190 342 Q205 330 210 318 Q197 328 190 342Z" fill="rgba(255,255,255,0.15)"/>
                <path d="M490 368 Q492 348 490 332" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round"/>
                <path d="M490 348 Q505 335 510 322 Q496 330 490 348Z" fill="rgba(255,255,255,0.2)"/>
                <path d="M490 340 Q476 328 472 316 Q484 326 490 340Z" fill="rgba(255,255,255,0.15)"/>
              </svg>
            </div>

            {/* Logo with onLoad trigger */}
            <img
              src="/icon-512.png"
              alt="Lazy Sprout"
              onLoad={() => {
                const root = document.getElementById('lg-splash-root');
                if (root) {
                  root.classList.add('lg-splash-ready');
                  setTimeout(() => {
                    root.classList.add('lg-do-exit');
                    setTimeout(() => {
                      localStorage.setItem('lazysprout_splashSeen','true');
                      setShowSplash(false);
                    }, 800);
                  }, 5500);
                }
              }}
              style={{ display:"none" }}
            />

            {/* App name */}
            <div className="lg-title" style={{ textAlign:"center", marginBottom:6 }}>
              <div style={{ color:"#fff", fontWeight:900, fontSize:34, fontFamily:"'Quicksand',sans-serif", letterSpacing:-0.5 }}>Lazy Sprout</div>
              <div style={{ color:"#a5d6a7", fontSize:13, fontWeight:700, marginTop:3, fontFamily:"'Quicksand',sans-serif" }}>by Lazy Brie</div>
            </div>

            {/* Tagline */}
            <div className="lg-sub" style={{ textAlign:"center", marginBottom:6, padding:"0 32px" }}>
              <div style={{ color:"#c8e6c9", fontSize:12, lineHeight:1.6, fontFamily:"'Quicksand',sans-serif" }}>
                Milk jugs, containers & budget-friendly
              </div>
            </div>
            <div className="lg-tagline" style={{ textAlign:"center", marginBottom:30, padding:"0 32px" }}>
              <div style={{ color:"#81c784", fontSize:12, fontWeight:700, fontFamily:"'Quicksand',sans-serif" }}>
                gardening — made simple 🌱
              </div>
            </div>

            {/* Loading bar */}
            <div className="lg-bar" style={{ width:180, marginBottom:16 }}>
              <div style={{ height:3, background:"rgba(255,255,255,0.15)", borderRadius:4, overflow:"hidden" }}>
                <div className="lg-bar-fill" style={{ height:"100%", background:"#a5d6a7", borderRadius:4 }} />
              </div>
            </div>

            {/* Dots */}
            <div className="lg-dots" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
              <span className="lg-dot" /><span className="lg-dot" /><span className="lg-dot" />
              <span style={{ color:"rgba(255,255,255,0.45)", fontSize:11, fontFamily:"'Quicksand',sans-serif" }}>Growing your garden</span>
            </div>

            {/* Skip button */}
            <button className="lg-skip"
              onClick={() => { localStorage.setItem('lazysprout_splashSeen','true'); setShowSplash(false); }}
              style={{ background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"6px 18px", color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Quicksand',sans-serif" }}>
              Tap to skip
            </button>
          </div>
        </div>
      )}

      {/* ── ONBOARDING ── */}
      {onboarding && (
        <div style={{ position:"fixed", inset:0, zIndex:300, background:"linear-gradient(160deg,#e8f5e9,#fffde7)", overflowY:"auto", maxWidth:480, margin:"0 auto" }}>
          <div style={{ padding:"36px 18px 40px" }}>
            <div style={{ textAlign:"center", marginBottom:22 }}>
              <div style={{ fontSize:52 }}>🪴</div>
              <div style={{ fontWeight:900, fontSize:22, color:"#1b5e20", marginTop:8 }}>Welcome to Lazy Sprout!</div>
              <div style={{ fontSize:12, color:"#666", marginTop:5, lineHeight:1.5 }}>Pick your <b>USDA Hardiness Zone</b> to personalize everything for your climate.</div>

              {/* ── AUTO DETECT BUTTON ── */}
              <AutoDetectZone onDetected={(z) => { setMyZone(z); setOnboarding(false); }} />

              <div style={{ fontSize:10, color:"#aaa", marginTop:8 }}>— or pick manually below —</div>
              <div style={{ fontSize:10, color:"#888", background:"#e8f5e9", borderRadius:8, padding:"4px 10px", display:"inline-block", marginTop:4 }}>💡 Not sure? Search "USDA zone [your zip code]"</div>
            </div>
            <div style={{ fontWeight:800, color:"#2e7d32", fontSize:12, marginBottom:8 }}>🗺️ Select Your Zone:</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:14 }}>
              {ZONES.map(z => (
                <button key={z.zone} onClick={() => { setMyZone(z); setOnboarding(false); }}
                  style={{ background:z.color, border:`2px solid ${z.tc}20`, borderRadius:12, padding:"9px 7px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:18 }}>{z.emoji}</span>
                  <div>
                    <div style={{ fontWeight:900, fontSize:12, color:z.tc }}>Zone {z.zone}</div>
                    <div style={{ fontSize:9, color:z.tc, opacity:0.7, lineHeight:1.2 }}>{z.temp}</div>
                    <div style={{ fontSize:9, color:z.tc, opacity:0.5, lineHeight:1.2 }}>{z.region}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setOnboarding(false)} style={{ width:"100%", background:"transparent", border:"none", color:"#aaa", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Skip for now</button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(90deg,#43a047,#66bb6a)", padding:"12px 14px 0", borderRadius:"0 0 22px 22px", boxShadow:"0 4px 18px #43a04740", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <img src="/icon-192.png" alt="Lazy Sprout logo"
            style={{ width:42, height:42, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", objectFit:"cover", flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontWeight:900, fontSize:17, lineHeight:1.1 }}>Lazy Sprout</div>
            <div style={{ color:"#c8e6c9", fontSize:9, lineHeight:1.3 }}>Your beginner garden helper 🌱</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
            {thirstyCount > 0 && <span style={{ background:"#ff7043", color:"#fff", borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:800 }}>💧 {thirstyCount} thirsty</span>}
            <button onClick={() => setShowZonePicker(true)}
              style={{ background:myZone?myZone.color:"rgba(255,255,255,0.25)", color:myZone?myZone.tc:"#fff", border:"none", borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              {myZone ? `${myZone.emoji} Zone ${myZone.zone}` : "🗺️ Set My Zone"}
            </button>
          </div>
        </div>

        {/* ── SCROLLING PLANT STRIP ── */}
        <style>{`
          @keyframes lgScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .lg-plant-strip { animation: lgScroll 18s linear infinite; display:flex; width:max-content; }
          .lg-plant-strip:hover { animation-play-state: paused; }
        `}</style>
        <div style={{ overflow:"hidden", marginLeft:-14, marginRight:-14, marginBottom:0, paddingBottom:10 }}>
          <div className="lg-plant-strip">
            {["🍅","🥬","🫑","🥒","🌿","🍓","🥔","🌱","🍠","🧄","🌸","🫚","🌾","🥕","🫘","🧅","🥦","🌻","🍅","🥬","🫑","🥒","🌿","🍓","🥔","🌱","🍠","🧄","🌸","🫚","🌾","🥕","🫘","🧅","🥦","🌻"].map((e,i) => (
              <span key={i} style={{ fontSize:20, padding:"0 10px", opacity:0.85 }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display:"flex", background:"#fff", margin:"10px 12px 0", borderRadius:12, padding:3, boxShadow:"0 2px 8px #0001" }}>
        {[["garden","🌱","My Garden"],["tracker","🌿","Tracker"],["calc","🧮","Calc"],["calendar","📅","Calendar"],["transplant","🪴","Transplant"],["guides","📖","Guides"]].map(([k,icon,label]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex:1, background:tab===k?"linear-gradient(135deg,#43a047,#66bb6a)":"transparent", color:tab===k?"#fff":"#999", border:"none", borderRadius:10, padding:"6px 2px", fontWeight:800, fontSize:10, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <span style={{ fontSize:15 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ padding:"10px 12px 80px" }}>

        {/* ══ MY GARDEN ══ */}
        {tab === "garden" && (
          <div>

            {/* ── COMMAND CENTER HEADER ── */}
            {plants.length > 0 ? (
              <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", borderRadius:18, padding:"16px 16px 14px", marginBottom:12, boxShadow:"0 4px 20px #1b5e2040" }}>
                {/* Date + zone */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ color:"#a5d6a7", fontSize:10, fontWeight:700 }}>
                    📅 {new Date().toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" })}
                  </div>
                  {myZone && (
                    <button onClick={() => setShowZonePicker(true)}
                      style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:20, padding:"2px 9px", color:"#c8e6c9", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      {myZone.emoji} Zone {myZone.zone}
                    </button>
                  )}
                </div>

                {/* Stats row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                  {[
                    ["🌱", plants.length, plants.length===1?"plant":"plants", "#e8f5e9","#43a047"],
                    ["💧", thirstyToday.length, thirstyToday.length===1?"thirsty":"thirsty", "#e3f2fd","#29b6f6"],
                    ["🪴", transplantReady.length, transplantReady.length===1?"ready":"ready", "#fff3e0","#ff9800"],
                  ].map(([icon,val,label,bg,col]) => (
                    <div key={label+icon} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:"8px 6px", textAlign:"center" }}>
                      <div style={{ fontSize:16 }}>{icon}</div>
                      <div style={{ fontWeight:900, fontSize:20, color:"#fff", lineHeight:1 }}>{val}</div>
                      <div style={{ fontSize:9, color:"#a5d6a7", marginTop:1 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Next events */}
                {(() => {
                  const nextWater = plants.filter(p => daysSince(p.lastWatered) < p.waterEvery)
                    .sort((a,b) => (a.waterEvery - daysSince(a.lastWatered)) - (b.waterEvery - daysSince(b.lastWatered)))[0];
                  const nextTransplant = plants.filter(p => {
                    const ts = getTS(p, daysSince(p.planted));
                    return ts.urgency === "watch" || ts.urgency === "ready" || ts.urgency === "urgent";
                  }).sort((a,b) => daysSince(b.planted) - daysSince(a.planted))[0];
                  if (!nextWater && !nextTransplant) return null;
                  return (
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {nextWater && (() => {
                        const nextDate = new Date(nextWater.lastWatered);
                        nextDate.setDate(nextDate.getDate() + nextWater.waterEvery);
                        const daysLeft = Math.ceil((nextDate - new Date(TODAY)) / 86400000);
                        const dateLabel = daysLeft <= 0 ? "Today!" : daysLeft === 1 ? "Tomorrow" : nextDate.toLocaleDateString("en-US",{month:"short",day:"numeric"});
                        return (
                          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:9, padding:"6px 10px", fontSize:10, color:"#e3f2fd", display:"flex", justifyContent:"space-between" }}>
                            <span>💧 Next watering: <b style={{ color:"#fff" }}>{nextWater.emoji} {nextWater.name}</b></span>
                            <span style={{ color:"#81d4fa", fontWeight:700 }}>{dateLabel}</span>
                          </div>
                        );
                      })()}
                      {nextTransplant && (() => {
                        const ts = getTS(nextTransplant, daysSince(nextTransplant.planted));
                        const daysLeft = Math.max(0, ts.daysMin - daysSince(nextTransplant.planted));
                        return (
                          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:9, padding:"6px 10px", fontSize:10, color:"#ffe0b2", display:"flex", justifyContent:"space-between" }}>
                            <span>🪴 Next transplant: <b style={{ color:"#fff" }}>{nextTransplant.emoji} {nextTransplant.name}</b></span>
                            <span style={{ color:"#ffcc80", fontWeight:700 }}>{daysLeft <= 0 ? "Now!" : `in ${daysLeft}d`}</span>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Empty state command center */
              <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", borderRadius:18, padding:"20px 18px 20px", marginBottom:12, textAlign:"center" }}>
                {/* Mini sprout illustration */}
                <div style={{ margin:"0 auto 8px", width:"70%", maxWidth:240 }}>
                  <svg width="100%" viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg">
                    <rect x="268" y="235" width="144" height="80" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="3"/>
                    <path d="M412 245 Q445 245 445 270 Q445 295 412 295" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round"/>
                    <rect x="310" y="212" width="60" height="28" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="3"/>
                    <rect x="318" y="198" width="44" height="18" rx="5" fill="#a5d6a7"/>
                    <rect x="268" y="280" width="144" height="35" fill="#5d4037" rx="0 0 12 12"/>
                    <ellipse cx="340" cy="280" rx="72" ry="8" fill="#6d4c41"/>
                    <path d="M340 278 Q337 250 336 220 Q335 190 340 160" fill="none" stroke="#a5d6a7" strokeWidth="5" strokeLinecap="round"/>
                    <path d="M336 220 Q305 195 298 168 Q318 178 332 202 Q334 212 336 220Z" fill="#c8e6c9"/>
                    <path d="M338 210 Q372 180 382 152 Q360 165 345 192 Q341 201 338 210Z" fill="#e8f5e9"/>
                    <ellipse cx="340" cy="158" rx="8" ry="11" fill="#a5d6a7" transform="rotate(-5 340 158)"/>
                    <path d="M190 308 Q188 290 190 275" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M190 290 Q175 278 170 265 Q183 272 190 288Z" fill="rgba(255,255,255,0.15)"/>
                    <path d="M490 308 Q492 288 490 272" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M490 288 Q505 275 510 262 Q496 270 490 288Z" fill="rgba(255,255,255,0.15)"/>
                    <ellipse cx="340" cy="310" rx="170" ry="14" fill="#5d4037"/>
                  </svg>
                </div>
                <div style={{ color:"#fff", fontWeight:900, fontSize:21, marginBottom:6, lineHeight:1.3 }}>Your Garden Helper</div>
                <div style={{ color:"#a5d6a7", fontSize:12, marginBottom:16, lineHeight:1.8 }}>
                  Keep track of watering, sprouts, and plant progress — without the guesswork.
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18 }}>
                  {[
                    ["💧","Know exactly when to water"],
                    ["🌱","Get notified when sprouts are expected"],
                    ["🪴","See when it's time to transplant"],
                  ].map(([icon,text]) => (
                    <div key={text} style={{ background:"rgba(255,255,255,0.12)", borderRadius:10, padding:"9px 14px", fontSize:12, color:"#fff", display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
                      <span style={{ fontSize:18 }}>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                {!myZone && (
                  <button onClick={() => setShowZonePicker(true)}
                    style={{ background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.3)", borderRadius:12, padding:"10px 16px", color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer", fontFamily:"inherit", marginBottom:10, display:"block", width:"100%" }}>
                    🗺️ First: Set my growing zone
                  </button>
                )}
                <button onClick={() => setShowAdd(true)}
                  style={{ background:"linear-gradient(135deg,#ff7043,#ff8a65)", border:"none", borderRadius:12, padding:"14px 16px", color:"#fff", fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"inherit", width:"100%", boxShadow:"0 4px 14px rgba(255,112,67,0.4)" }}>
                  🌱 Add My First Plant
                </button>
              </div>
            )}

            {/* ── TODAY'S TASKS ── */}
            {plants.length > 0 && (() => {
              const tasks = [];
              plants.forEach(p => {
                const days = daysSince(p.planted);
                const ts = getTS(p, days);
                const sproutMin = p.sproutMin || 7;
                const sproutMax = p.sproutMax || 14;
                const sprouted = days > sproutMax;
                const sproutingSoon = !sprouted && days >= sproutMin;

                if (daysSince(p.lastWatered) >= p.waterEvery)
                  tasks.push({ priority:1, icon:"💧", color:"#29b6f6", bg:"#e3f2fd", text:`Water ${p.name}`, plant:p });
                if (ts.urgency === "urgent")
                  tasks.push({ priority:2, icon:"🚨", color:"#f44336", bg:"#ffebee", text:`Transplant ${p.name} NOW`, plant:p });
                if (ts.urgency === "ready")
                  tasks.push({ priority:3, icon:"🪴", color:"#ff9800", bg:"#fff3e0", text:`Transplant ${p.name}`, plant:p });
                if (sproutingSoon)
                  tasks.push({ priority:4, icon:"🌱", color:"#43a047", bg:"#e8f5e9", text:`Check ${p.name} for sprouts`, plant:p });
                if (ts.urgency === "watch")
                  tasks.push({ priority:5, icon:"👀", color:"#8d6e63", bg:"#efebe9", text:`Watch ${p.name} for transplant signs`, plant:p });
              });
              tasks.sort((a,b) => a.priority - b.priority);
              if (tasks.length === 0) return (
                <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#f1f8e9)", border:"2px solid #a5d6a7", textAlign:"center", padding:"16px" }}>
                  <div style={{ fontSize:24, marginBottom:4 }}>✅</div>
                  <div style={{ fontWeight:800, fontSize:13, color:"#2e7d32" }}>All caught up!</div>
                  <div style={{ fontSize:10, color:"#888", marginTop:2 }}>Your garden is happy today 🌿</div>
                </div>
              );
              return (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:7 }}>📋 Today's Garden Tasks</div>
                  {tasks.map((t,i) => (
                    <button key={i} onClick={() => setSelectedPlant(t.plant)}
                      style={{ display:"flex", alignItems:"center", gap:10, background:t.bg, border:`1.5px solid ${t.color}30`, borderRadius:12, padding:"10px 12px", width:"100%", marginBottom:6, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>{t.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800, fontSize:12, color:"#333" }}>{t.text}</div>
                        <div style={{ fontSize:10, color:"#888", marginTop:1 }}>{t.plant.emoji} {t.plant.container} · {daysSince(t.plant.planted)}d old</div>
                      </div>
                      <span style={{ fontSize:12, color:"#ccc" }}>›</span>
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* ── PLANT LIST HEADER ── */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
              <div style={{ fontWeight:900, fontSize:14, color:"#2e7d32" }}>🌿 My Garden ({plants.length})</div>
              <button onClick={() => setShowAdd(true)} style={btn("linear-gradient(135deg,#ff7043,#ff8a65)")}>+ Add Plant</button>
            </div>

            {/* ── PLANT CARDS ── */}
            {plants.map(plant => {
              const days      = daysSince(plant.planted);
              const wr        = getWateringRange(plant.waterEvery, myZone, plant.container);
              const ts        = getTS(plant, days);
              const ur        = UR[ts.urgency];
              const thirsty   = daysSince(plant.lastWatered) >= plant.waterEvery;
              const sproutMin = plant.sproutMin || 7;
              const sproutMax = plant.sproutMax || 14;
              const sprouted  = days > sproutMax;
              const sproutingSoon = !sprouted && days >= sproutMin;
              const daysToSprout  = Math.max(0, sproutMin - days);

              // Calc next water date
              const nextWaterDate = new Date(plant.lastWatered);
              nextWaterDate.setDate(nextWaterDate.getDate() + plant.waterEvery);
              const daysUntilWater = Math.ceil((nextWaterDate - new Date(TODAY)) / 86400000);
              const nextWaterLabel = thirsty ? "Water now!" : daysUntilWater <= 0 ? "Water today!" : daysUntilWater === 1 ? "Tomorrow" : nextWaterDate.toLocaleDateString("en-US",{month:"long",day:"numeric"});
              const lastWaterLabel = daysSince(plant.lastWatered) === 0 ? "Today" : new Date(plant.lastWatered+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"});

              // Calc transplant window
              const td = TRANSPLANT_MAP[plant.container];
              const transplantDate = td ? (() => { const d = new Date(plant.planted); d.setDate(d.getDate() + td.daysMin); return d; })() : null;
              const transplantLabel = transplantDate ? transplantDate.toLocaleDateString("en-US",{month:"long",day:"numeric"}) : null;

              return (
                <div key={plant.id} onClick={() => setSelectedPlant(plant)}
                  style={{ ...card, cursor:"pointer", border:thirsty?"2px solid #ff7043":ts.urgency!=="growing"?`2px solid ${ur.border}`:"1.5px solid #e8f5e9", padding:0, overflow:"hidden", marginBottom:10 }}>
                  {/* Top color bar */}
                  <div style={{ height:4, background:thirsty?"linear-gradient(90deg,#ff7043,#ffb74d)":`linear-gradient(90deg,#43a047,#66bb6a ${plant.health}%,#e0e0e0 ${plant.health}%)` }} />

                  <div style={{ padding:"12px 13px" }}>
                    {/* Header row — emoji, name, jug, water button */}
                    <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:38, lineHeight:1 }}>{plant.emoji}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:900, fontSize:15, color:"#1b5e20", lineHeight:1.2 }}>{plant.name}</div>
                        <div style={{ fontSize:10, color:"#888", marginTop:2 }}>
                          {plant.jugNumber ? <span style={{ fontWeight:700, color:"#2e7d32" }}>🥛 Jug #{plant.jugNumber} · </span> : null}
                          {plant.container}{plant.indoor ? " · 🏠 Indoor" : ""}
                        </div>
                      </div>
                      <button onClick={ev => { ev.stopPropagation(); waterPlant(plant.id); }}
                        style={{ ...btn(thirsty?"linear-gradient(135deg,#29b6f6,#4dd0e1)":"#e3f2fd", thirsty?"#fff":"#90a4ae"), padding:"8px 10px", fontSize:18, flexShrink:0 }}>💧</button>
                    </div>

                    {/* Key info rows */}
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {/* Watering */}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:thirsty?"#fff3e0":"#f9fbe7", borderRadius:8, padding:"6px 10px" }}>
                        <div>
                          <span style={{ fontWeight:800, fontSize:11, color:thirsty?"#ff7043":"#1565c0" }}>💧 Next watering: </span>
                          <span style={{ fontWeight:900, fontSize:11, color:thirsty?"#ff7043":"#1b5e20" }}>{nextWaterLabel}</span>
                        </div>
                        <span style={{ fontSize:10, color:"#aaa" }}>Last: {lastWaterLabel}</span>
                      </div>

                      {/* Sprout */}
                      {plant.sproutedDate ? (
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#e8f5e9", borderRadius:8, padding:"6px 10px" }}>
                          <span style={{ fontWeight:800, fontSize:11, color:"#2e7d32" }}>🌱 Sprouted: {new Date(plant.sproutedDate+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}</span>
                          <span style={{ fontSize:10, color:"#888" }}>Day {Math.floor((new Date(plant.sproutedDate) - new Date(plant.planted)) / 86400000)}</span>
                        </div>
                      ) : !sprouted ? (
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f1f8e9", borderRadius:8, padding:"6px 10px" }}>
                          <span style={{ fontSize:11, color:sproutingSoon?"#43a047":"#888", fontWeight:sproutingSoon?800:400 }}>
                            🌱 {sproutingSoon ? "Check for sprouts!" : `Sprout expected in ~${daysToSprout}d`}
                          </span>
                          {sproutingSoon && (
                            <button onClick={ev => { ev.stopPropagation(); markSprouted(plant.id); }}
                              style={{ background:"linear-gradient(135deg,#43a047,#66bb6a)", border:"none", borderRadius:7, padding:"3px 9px", color:"#fff", fontSize:9, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                              Sprouted! 🌱
                            </button>
                          )}
                        </div>
                      ) : null}

                      {/* Transplant */}
                      {transplantLabel && (
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:ts.urgency==="urgent"?"#ffebee":ts.urgency==="ready"?"#fff3e0":"#f5f5f5", borderRadius:8, padding:"6px 10px" }}>
                          <span style={{ fontWeight:800, fontSize:11, color:ts.urgency==="urgent"?"#c62828":ts.urgency==="ready"?"#e65100":"#888" }}>
                            🪴 {ts.urgency==="urgent" ? "Transplant NOW!" : ts.urgency==="ready" ? "Ready to transplant!" : `Transplant: ${transplantLabel}`}
                          </span>
                          {(ts.urgency==="ready"||ts.urgency==="urgent") && (
                            <span style={{ fontSize:10, color:ts.urgency==="urgent"?"#c62828":"#e65100", fontWeight:700 }}>{ur.label.replace("🪴 ","").replace("🚨 ","")}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tap hint */}
                    <div style={{ fontSize:9, color:"#ccc", marginTop:7, textAlign:"right" }}>Tap for full details →</div>
                  </div>
                </div>
              );
            })}

            {plants.length === 0 && null}

            {showAdd && (
              <div style={{ position:"fixed", inset:0, background:"#0008", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
                onClick={() => setShowAdd(false)}>
                <div style={{ background:"#fff", borderRadius:"22px 22px 0 0", padding:18, width:"100%", maxWidth:480, paddingBottom:34, maxHeight:"86vh", overflowY:"auto" }}
                  onClick={ev => ev.stopPropagation()}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:11 }}>
                    <div style={{ fontWeight:900, fontSize:16, color:"#2e7d32" }}>🌱 Add New Plant</div>
                    <button onClick={() => setShowAdd(false)}
                      style={{ background:"#f5f5f5", border:"none", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:700, color:"#888", cursor:"pointer", fontFamily:"inherit" }}>
                      ✕ Cancel
                    </button>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:5 }}>Quick Pick</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {Object.entries(EMOJI_PRESETS).map(([em, preset]) => (
                        <button key={em} onClick={() => setNewPlant(p => ({ ...p, emoji:em, name:preset.name||p.name, container:preset.container, waterEvery:preset.waterEvery, sproutMin:preset.sproutMin||7, sproutMax:preset.sproutMax||14 }))}
                          style={{ background:newPlant.emoji===em?"#e8f5e9":"#f5f5f5", border:newPlant.emoji===em?"2px solid #43a047":"2px solid #e0e0e0", borderRadius:9, padding:"5px 8px", cursor:"pointer", fontSize:20 }}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>Plant Name</div>
                    <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                      <span style={{ fontSize:24 }}>{newPlant.emoji}</span>
                      <input value={newPlant.name} onChange={ev => setNewPlant(p => ({ ...p, name:ev.target.value }))}
                        placeholder="e.g. Cherry Tomatoes"
                        style={{ flex:1, border:"2px solid #e0e0e0", borderRadius:9, padding:"10px", fontSize:14, fontFamily:"inherit", outline:"none" }} />
                    </div>
                  </div>
                  {/* Jug number */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#2e7d32", marginBottom:4 }}>🥛 Jug / Container Label <span style={{ color:"#aaa", fontWeight:400 }}>(optional)</span></div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ background:"#e8f5e9", borderRadius:8, padding:"10px 12px", fontWeight:900, fontSize:13, color:"#2e7d32", whiteSpace:"nowrap" }}>Jug #</div>
                      <input
                        value={newPlant.jugNumber}
                        onChange={ev => setNewPlant(p => ({ ...p, jugNumber:ev.target.value }))}
                        placeholder="e.g. 1, 2, A, Front Porch..."
                        style={{ flex:1, border:"2px solid #e8f5e9", borderRadius:9, padding:"10px", fontSize:13, fontFamily:"inherit", outline:"none" }}
                      />
                    </div>
                    <div style={{ fontSize:9, color:"#aaa", marginTop:4 }}>💡 Label your physical jug with this number so you always know what's inside!</div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#2e7d32", marginBottom:4 }}>📅 Planting Date</div>
                    <input type="date" value={newPlant.plantedDate || TODAY}
                      onChange={ev => setNewPlant(p => ({ ...p, plantedDate:ev.target.value }))}
                      style={{ width:"100%", border:"2px solid #e8f5e9", borderRadius:12, padding:"10px", fontSize:14, fontFamily:"inherit", background:"#fff", boxSizing:"border-box" }} />
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#2e7d32", marginBottom:6 }}>📦 Container Type</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5, marginBottom:6 }}>
                      {CONTAINER_TYPES.map(c => {
                        const preset = CUSTOM_CONTAINER_PRESETS[c];
                        const emoji = preset?.emoji ||
                          (c==="Milk Jug"?"🥛": c==="5-Gal Bucket"?"🪣": c==="Plastic Pot"?"🪴": c==="Fabric Bag"?"👜": c==="Coffee Can"?"🥫": c==="Yogurt Container"?"🫙":"📦");
                        const selected = newPlant.container === c;
                        return (
                          <button key={c} onClick={() => setNewPlant(p => ({ ...p, container:c }))}
                            style={{ background:selected?"linear-gradient(135deg,#43a047,#66bb6a)":"#f5f5f5", color:selected?"#fff":"#444", border:selected?"2px solid #2e7d32":"2px solid #e0e0e0", borderRadius:10, padding:"7px 4px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", fontSize:10, fontWeight:700, lineHeight:1.3 }}>
                            <div style={{ fontSize:18, marginBottom:2 }}>{emoji}</div>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                    {/* Custom container info panel */}
                    {CUSTOM_CONTAINER_PRESETS[newPlant.container] && (
                      <div style={{ background:"linear-gradient(135deg,#e8f5e9,#e3f2fd)", borderRadius:10, padding:"9px 10px", border:"1.5px solid #a5d6a7", fontSize:10, color:"#444", lineHeight:1.6 }}>
                        <div style={{ fontWeight:800, color:"#1b5e20", marginBottom:4 }}>
                          {CUSTOM_CONTAINER_PRESETS[newPlant.container].emoji} Tips for {newPlant.container}
                        </div>
                        <div style={{ marginBottom:4 }}>💧 <b>Watering:</b> {CUSTOM_CONTAINER_PRESETS[newPlant.container].waterNote}</div>
                        <div style={{ marginBottom:4 }}>🌱 <b>Soil:</b> {CUSTOM_CONTAINER_PRESETS[newPlant.container].sizeNote}</div>
                        <div style={{ color:"#2e7d32", fontWeight:700 }}>🪴 <b>Transplant:</b> {CUSTOM_CONTAINER_PRESETS[newPlant.container].transplantNote}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>
                      Water every <b style={{ color:"#29b6f6" }}>{newPlant.waterEvery} days</b>
                    </div>
                    <input type="range" min={1} max={14} value={newPlant.waterEvery}
                      onChange={ev => setNewPlant(p => ({ ...p, waterEvery:+ev.target.value }))}
                      style={{ width:"100%", accentColor:"#29b6f6" }} />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:6 }}>🏠 Where are you growing?</div>
                    <div style={{ display:"flex", gap:7 }}>
                      {[[false,"🌿","Outdoor"],[ true,"🏠","Indoor"]].map(([val,icon,label]) => (
                        <button key={label} onClick={() => setNewPlant(p => ({ ...p, indoor:val,
                          container: val && p.container==="Milk Jug" ? "Mason Jar" : p.container }))}
                          style={{ flex:1, background:newPlant.indoor===val?"linear-gradient(135deg,#43a047,#66bb6a)":"#f5f5f5", color:newPlant.indoor===val?"#fff":"#666", border:newPlant.indoor===val?"2px solid #2e7d32":"2px solid #e0e0e0", borderRadius:10, padding:"9px 4px", cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:13 }}>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                    {newPlant.indoor && (
                      <div style={{ background:"linear-gradient(135deg,#e8f5e9,#e3f2fd)", borderRadius:9, padding:"7px 10px", marginTop:7, fontSize:10, color:"#444" }}>
                        🤧 <b>Allergy season tip:</b> Indoor herbs are low-pollen and safe to grow year-round! Mason jars, coffee cans, and yogurt containers work great on a windowsill.
                      </div>
                    )}
                  </div>
                  {/* Sprout prediction */}
                  <div style={{ marginBottom:14, background:"linear-gradient(135deg,#e8f5e9,#f1f8e9)", borderRadius:12, padding:"10px 12px", border:"1.5px solid #a5d6a7" }}>
                    <div style={{ fontWeight:800, fontSize:11, color:"#2e7d32", marginBottom:8 }}>🌱 Sprout Prediction</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:4 }}>Earliest sprout (days)</div>
                        <input type="number" min={1} max={60} value={newPlant.sproutMin}
                          onChange={ev => setNewPlant(p => ({ ...p, sproutMin:+ev.target.value }))}
                          style={{ width:"100%", border:"2px solid #c8e6c9", borderRadius:8, padding:"7px", fontSize:13, fontFamily:"inherit", boxSizing:"border-box", textAlign:"center" }} />
                      </div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:4 }}>Latest sprout (days)</div>
                        <input type="number" min={1} max={60} value={newPlant.sproutMax}
                          onChange={ev => setNewPlant(p => ({ ...p, sproutMax:+ev.target.value }))}
                          style={{ width:"100%", border:"2px solid #c8e6c9", borderRadius:8, padding:"7px", fontSize:13, fontFamily:"inherit", boxSizing:"border-box", textAlign:"center" }} />
                      </div>
                    </div>
                    <div style={{ fontSize:9, color:"#888", marginTop:6 }}>💡 Check your seed packet for germination days. Default is 7–14.</div>
                    <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:8, padding:"5px 8px", marginTop:6, fontSize:10, color:"#2e7d32", fontWeight:700 }}>
                      Expected sprout: Day {newPlant.sproutMin}–{newPlant.sproutMax} after planting
                    </div>
                  </div>
                  {/* Soil recommendation */}
                  {(() => {
                    const soil = getSoilRec(null, newPlant.name, newPlant.container);
                    if (!soil) return null;
                    return (
                      <div style={{ background:`linear-gradient(135deg,${soil.color},white)`, border:`1.5px solid ${soil.tc}30`, borderRadius:10, padding:"9px 10px", marginBottom:14 }}>
                        <div style={{ fontWeight:800, fontSize:11, color:soil.tc, marginBottom:3 }}>🪨 Recommended Soil: {soil.emoji} {soil.name}</div>
                        <div style={{ fontSize:10, color:"#555", lineHeight:1.5, marginBottom:4 }}>{soil.desc}</div>
                        <div style={{ fontSize:9, color:"#e65100", fontWeight:700 }}>⚠️ {soil.avoid}</div>
                      </div>
                    );
                  })()}
                  <button onClick={addPlant}
                    style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", padding:14, fontSize:14 }}>
                    🌱 Add to My Garden
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CALENDAR ══ */}
        {tab === "calendar" && (() => {
          const { year, month } = calendarMonth;
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const monthName = new Date(year, month).toLocaleDateString("en-US", { month:"long", year:"numeric" });
          const todayDate = new Date(); const isToday = (d) => d === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
          const dayStr = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const selectedEvents = calendarDay ? (calendarEvents[dayStr(calendarDay)] || []) : [];

          const EVENT_COLORS = { water:"#29b6f6", transplant:"#ff9800", transplant_end:"#f44336", planted:"#43a047" };
          const EVENT_LABELS = { water:"💧 Water", transplant:"🪴 Transplant window", transplant_end:"⚠️ Transplant deadline", planted:"🌱 Planted" };

          return (
            <div>
              <div style={{ fontWeight:900, fontSize:15, color:"#2e7d32", marginBottom:2 }}>📅 Garden Calendar</div>
              <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>Tap any day to see what's happening!</div>

              {/* Legend */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                {Object.entries(EVENT_LABELS).map(([type, label]) => (
                  <div key={type} style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:"#555" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:EVENT_COLORS[type] }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Month nav */}
              <div style={{ ...card, padding:"10px 12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <button onClick={() => setCalendarMonth(m => { const d = new Date(m.year, m.month - 1); return { year:d.getFullYear(), month:d.getMonth() }; })}
                    style={btn("#e8f5e9","#2e7d32",{ padding:"4px 12px" })}>‹</button>
                  <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20" }}>{monthName}</div>
                  <button onClick={() => setCalendarMonth(m => { const d = new Date(m.year, m.month + 1); return { year:d.getFullYear(), month:d.getMonth() }; })}
                    style={btn("#e8f5e9","#2e7d32",{ padding:"4px 12px" })}>›</button>
                </div>

                {/* Day headers */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                    <div key={d} style={{ textAlign:"center", fontSize:9, fontWeight:800, color:"#aaa", padding:"2px 0" }}>{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const ds = dayStr(d);
                    const evs = calendarEvents[ds] || [];
                    const types = [...new Set(evs.map(e => e.type))];
                    const today = isToday(d);
                    const selected = calendarDay === d;
                    return (
                      <button key={d} onClick={() => setCalendarDay(calendarDay === d ? null : d)}
                        style={{ background:selected?"linear-gradient(135deg,#43a047,#66bb6a)":today?"#e8f5e9":"transparent", border:today?"2px solid #43a047":selected?"2px solid #2e7d32":"2px solid transparent", borderRadius:8, padding:"4px 2px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", minHeight:36 }}>
                        <div style={{ fontSize:11, fontWeight:today||selected?900:500, color:selected?"#fff":today?"#2e7d32":"#444" }}>{d}</div>
                        <div style={{ display:"flex", justifyContent:"center", gap:1, flexWrap:"wrap", marginTop:1 }}>
                          {types.slice(0,3).map(t => (
                            <div key={t} style={{ width:5, height:5, borderRadius:"50%", background:selected?"rgba(255,255,255,0.8)":EVENT_COLORS[t] }} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected day detail */}
              {calendarDay && (
                <div style={card}>
                  <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20", marginBottom:8 }}>
                    {new Date(year, month, calendarDay).toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" })}
                  </div>
                  {selectedEvents.length === 0 ? (
                    <div style={{ fontSize:11, color:"#aaa", textAlign:"center", padding:"10px 0" }}>Nothing scheduled — enjoy the day! 🌿</div>
                  ) : (
                    selectedEvents.map((ev, i) => (
                      <button key={i} onClick={() => { const p = plants.find(pl => pl.id === ev.id); if (p) { setSelectedPlant(p); setTab("garden"); } }}
                        style={{ display:"flex", alignItems:"center", gap:9, background:`${EVENT_COLORS[ev.type]}15`, border:`1.5px solid ${EVENT_COLORS[ev.type]}40`, borderRadius:10, padding:"8px 10px", width:"100%", marginBottom:5, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                        <span style={{ fontSize:20 }}>{ev.emoji}</span>
                        <div>
                          <div style={{ fontWeight:800, fontSize:11, color:"#333" }}>{ev.name}</div>
                          <div style={{ fontSize:10, color:EVENT_COLORS[ev.type], fontWeight:700 }}>{EVENT_LABELS[ev.type]}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Upcoming this month */}
              {(() => {
                const upcoming = [];
                for (let d = todayDate.getDate() + 1; d <= daysInMonth && upcoming.length < 8; d++) {
                  const ds = dayStr(d);
                  if (calendarEvents[ds]) {
                    calendarEvents[ds].forEach(ev => {
                      if (ev.type !== "water") upcoming.push({ d, ds, ev });
                    });
                  }
                }
                if (upcoming.length === 0) return null;
                return (
                  <div style={card}>
                    <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20", marginBottom:8 }}>📌 Coming up this month</div>
                    {upcoming.map(({ d, ev }, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"6px 0", borderBottom:"1px solid #f5f5f5" }}>
                        <div style={{ background:`${EVENT_COLORS[ev.type]}20`, borderRadius:8, padding:"4px 8px", minWidth:32, textAlign:"center" }}>
                          <div style={{ fontWeight:900, fontSize:13, color:EVENT_COLORS[ev.type] }}>{d}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:11, color:"#333" }}>{ev.emoji} {ev.name}</div>
                          <div style={{ fontSize:10, color:EVENT_COLORS[ev.type], fontWeight:700 }}>{EVENT_LABELS[ev.type]}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* ══ GUIDES ══ */}
        {tab === "guides" && !selectedGuide && !selectedWatering && !selectedTrouble && (
          <div>
            <div style={{ display:"flex", background:"#fff", borderRadius:11, padding:3, marginBottom:10, gap:3 }}>
              {[["indoor","🏠 Indoor"],["watering","💧 Water"],["winter","❄️ Winter"],["zones","🗺️ Zones"],["trouble","🚑 Help"]].map(([k,l]) => (
                <button key={k} onClick={() => setGuidesTab(k)}
                  style={{ flex:1, background:guidesTab===k?"linear-gradient(135deg,#29b6f6,#4dd0e1)":"transparent", color:guidesTab===k?"#fff":"#666", border:"none", borderRadius:9, padding:"7px 2px", fontWeight:800, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>
                  {l}
                </button>
              ))}
            </div>

            {guidesTab === "trouble" && (
              <div>
                <div style={{ fontWeight:900, fontSize:14, color:"#c62828", marginBottom:4 }}>🚑 Troubleshooting</div>
                <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>Something went wrong? Find it here!</div>
                {TROUBLESHOOTING.map(t => (
                  <button key={t.id} onClick={() => setSelectedTrouble(t)}
                    style={{ ...card, width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:11, alignItems:"center", background:`linear-gradient(135deg,${t.color},white)`, border:`1.5px solid ${t.tc}20` }}>
                    <span style={{ fontSize:30 }}>{t.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <span style={{ fontWeight:900, fontSize:13, color:t.tc }}>{t.title}</span>
                        {t.urgent && <span style={{ background:"#ffebee", color:"#c62828", borderRadius:6, padding:"1px 6px", fontSize:9, fontWeight:800 }}>⚡ Act fast</span>}
                      </div>
                      <div style={{ fontSize:10, color:"#888", marginTop:2 }}>{t.looks.slice(0,55)}…</div>
                    </div>
                    <span style={{ fontSize:16, color:"#ccc" }}>›</span>
                  </button>
                ))}
              </div>
            )}

            {guidesTab === "zones" && !zoneDetail && (
              <div>
                {myZone && (
                  <div style={{ ...card, background:`linear-gradient(135deg,${myZone.color},white)`, border:`1.5px solid ${myZone.tc}20`, display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
                    <span style={{ fontSize:22 }}>{myZone.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, color:"#888" }}>Your current zone</div>
                      <div style={{ fontWeight:900, fontSize:13, color:myZone.tc }}>Zone {myZone.zone} · {myZone.region}</div>
                      <div style={{ fontSize:10, color:"#666" }}>🗓 {myZone.plantingTime}</div>
                    </div>
                    <button onClick={() => setShowZonePicker(true)} style={{ ...btn("transparent",myZone.tc), border:`1.5px solid ${myZone.tc}40`, padding:"4px 9px", fontSize:10 }}>Change</button>
                  </div>
                )}
                <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#c8e6c9)", fontSize:10, color:"#2e7d32", marginBottom:10 }}>💡 Not sure of your zone? Search "USDA zone [your zip code]"</div>
                <div style={{ fontWeight:800, fontSize:11, color:"#555", marginBottom:7 }}>Tap any zone to explore planting tips:</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  {ZONES.map(z => (
                    <button key={z.zone} onClick={() => setZoneDetail(z)}
                      style={{ background:myZone?.zone===z.zone?z.tc:z.color, border:`2px solid ${z.tc}20`, borderRadius:12, padding:"9px 7px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7, boxShadow:"0 2px 7px #0001" }}>
                      <span style={{ fontSize:18 }}>{z.emoji}</span>
                      <div>
                        <div style={{ fontWeight:900, fontSize:12, color:myZone?.zone===z.zone?"#fff":z.tc }}>Zone {z.zone}</div>
                        <div style={{ fontSize:9, color:myZone?.zone===z.zone?"rgba(255,255,255,0.8)":z.tc, opacity:0.8 }}>{z.temp}</div>
                        <div style={{ fontSize:9, color:myZone?.zone===z.zone?"rgba(255,255,255,0.6)":z.tc, opacity:0.6 }}>{z.region}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {guidesTab === "zones" && zoneDetail && (
              <div>
                <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:10 }}>
                  <button onClick={() => setZoneDetail(null)} style={btn("#e8f5e9","#2e7d32")}>← All Zones</button>
                  <button onClick={() => { setMyZone(zoneDetail); setZoneDetail(null); }} style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), fontSize:11 }}>✅ Set as My Zone</button>
                </div>
                <div style={{ ...card, background:`linear-gradient(135deg,${zoneDetail.color},white)`, border:`2px solid ${zoneDetail.tc}20` }}>
                  <div style={{ display:"flex", gap:11, alignItems:"center" }}>
                    <span style={{ fontSize:40 }}>{zoneDetail.emoji}</span>
                    <div>
                      <div style={{ fontWeight:900, fontSize:18, color:zoneDetail.tc }}>Zone {zoneDetail.zone}</div>
                      <div style={{ fontSize:11, color:"#666" }}>📍 {zoneDetail.region} · 🌡️ {zoneDetail.temp}</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
                    <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:9, padding:7, textAlign:"center" }}>
                      <div>🌱</div><div style={{ fontWeight:800, fontSize:10, color:"#2e7d32" }}>Outdoors</div><div style={{ fontSize:10, color:"#555" }}>{zoneDetail.plantingTime}</div>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:9, padding:7, textAlign:"center" }}>
                      <div>🏠</div><div style={{ fontWeight:800, fontSize:10, color:"#e65100" }}>Indoor Start</div><div style={{ fontSize:10, color:"#555" }}>{zoneDetail.indoorStart}</div>
                    </div>
                  </div>
                </div>
                <div style={card}>
                  <div style={{ fontWeight:900, fontSize:12, color:"#2e7d32", marginBottom:7 }}>🌿 Best Plants for Zone {zoneDetail.zone}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{zoneDetail.plants.map(p => <span key={p} style={badge(zoneDetail.color,zoneDetail.tc)}>{p}</span>)}</div>
                </div>
                <div style={card}>
                  <div style={{ fontWeight:900, fontSize:12, color:"#2e7d32", marginBottom:7 }}>🥛 Container Tips</div>
                  {zoneDetail.tips.map((t,i) => (
                    <div key={i} style={{ display:"flex", gap:7, background:"#f9fbe7", borderRadius:7, padding:"6px 8px", marginBottom:5 }}>
                      <span style={{ color:"#43a047", fontWeight:900, flexShrink:0 }}>✓</span>
                      <span style={{ fontSize:11, color:"#444" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guidesTab === "indoor" && (
              <div>
                <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#e3f2fd)", border:"2px solid #a5d6a7" }}>
                  <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:6 }}>🏠 Indoor & Allergy-Season Gardening</div>
                  <div style={{ fontSize:11, color:"#555", lineHeight:1.6, marginBottom:10 }}>Can't be outside due to allergies? You can still grow! Indoor herbs are low-pollen, easy, and smell amazing. Most need just a sunny windowsill or a simple grow light.</div>
                  <div style={{ fontWeight:800, fontSize:11, color:"#1b5e20", marginBottom:6 }}>🤧 Allergy-Safe Tips</div>
                  {ALLERGY_TIPS.map((t,i) => (
                    <div key={i} style={{ display:"flex", gap:8, background:"rgba(255,255,255,0.6)", borderRadius:8, padding:"6px 8px", marginBottom:5, fontSize:10, color:"#444" }}>
                      <span>{t.icon}</span><span>{t.tip}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontWeight:900, fontSize:13, color:"#2e7d32", margin:"12px 0 8px" }}>🌿 Best Indoor Herbs</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {INDOOR_GUIDES.map(g => (
                    <button key={g.name} onClick={() => setSelectedGuide({ ...g, indoor:true })}
                      style={{ background:"#fff", border:`2px solid ${g.allergySafe?"#a5d6a7":"#ffe0b2"}`, borderRadius:14, padding:"11px 7px", textAlign:"center", cursor:"pointer", fontFamily:"inherit", position:"relative", boxShadow:"0 2px 8px #0001" }}>
                      <div style={{ position:"absolute", top:4, right:4, ...badge(g.allergySafe?"#e8f5e9":"#fff3e0", g.allergySafe?"#2e7d32":"#e65100"), fontSize:8 }}>
                        {g.allergySafe ? "✅ Allergy safe" : "⚠️ Check first"}
                      </div>
                      <div style={{ fontSize:32, marginTop:4 }}>{g.emoji}</div>
                      <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20", marginTop:4 }}>{g.name}</div>
                      <div style={{ fontSize:9, color:"#888" }}>📦 {g.container}</div>
                      <div style={{ fontSize:9, color:"#29b6f6" }}>☀️ {g.sun}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {guidesTab === "winter" && (
              <div>
                {/* Hero */}
                <div style={{ background:"linear-gradient(135deg,#0d47a1,#1565c0)", borderRadius:18, padding:"18px 16px", marginBottom:12, boxShadow:"0 4px 20px #0d47a140" }}>
                  <div style={{ color:"#fff", fontWeight:900, fontSize:20, marginBottom:4 }}>❄️ Winter Sowing</div>
                  <div style={{ color:"#bbdefb", fontSize:11, lineHeight:1.7 }}>
                    Start seeds in milk jugs outdoors during winter. Nature does the cold stratification work for you — and seeds sprout when conditions are just right in spring!
                  </div>
                </div>

                {/* What is winter sowing */}
                <div style={{ ...card, marginBottom:10 }}>
                  <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:8 }}>🥛 What is Winter Sowing?</div>
                  <div style={{ fontSize:11, color:"#444", lineHeight:1.7, marginBottom:10 }}>
                    Winter sowing is planting seeds in milk jugs or other containers and leaving them outside all winter. The jugs act as mini greenhouses — cold temps break seed dormancy naturally, and seeds sprout on their own schedule when spring arrives.
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { emoji:"✅", title:"What you need", items:["Gallon milk jugs","Potting mix","Seeds","Tape & marker","A drill or knife"] },
                      { emoji:"🌟", title:"Why it works", items:["No grow lights needed","No indoor space needed","Seeds self-regulate","Stronger seedlings","Basically free!"] },
                    ].map(s => (
                      <div key={s.title} style={{ background:"#f9fbe7", borderRadius:10, padding:"10px" }}>
                        <div style={{ fontWeight:800, fontSize:11, color:"#1b5e20", marginBottom:6 }}>{s.emoji} {s.title}</div>
                        {s.items.map((item,i) => (
                          <div key={i} style={{ fontSize:10, color:"#555", marginBottom:3, display:"flex", gap:5 }}>
                            <span style={{ color:"#43a047" }}>•</span>{item}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step by step */}
                <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:8 }}>📋 How to Set Up a Winter Sowing Jug</div>
                {[
                  { n:"1", icon:"✂️", title:"Prepare the jug", desc:"Cut the jug almost in half horizontally, leaving a 1–2\" hinge on the handle side so the top flips open. Remove the cap — this is your ventilation!" },
                  { n:"2", icon:"🕳️", title:"Add drainage holes", desc:"Poke 4–6 holes in the bottom with a drill, nail, or hot skewer. Good drainage is essential — sitting water will rot your seeds." },
                  { n:"3", icon:"🪨", title:"Add soil", desc:"Fill the bottom half with 3–4\" of moistened potting mix. Don't use garden soil — it compacts and doesn't drain well in containers." },
                  { n:"4", icon:"🌱", title:"Sow your seeds", desc:"Scatter seeds on the surface and cover lightly per packet directions. Label the outside of the jug with the plant name, variety, and date!" },
                  { n:"5", icon:"🔒", title:"Close and seal", desc:"Tape the two halves shut with duct tape. Leave the cap off for ventilation and rain to get in." },
                  { n:"6", icon:"🌨️", title:"Set outside and wait", desc:"Place jugs in a spot that gets some sun and will collect rain/snow. Face them south if possible. Now just... wait! Check monthly." },
                  { n:"7", icon:"🌱", title:"Watch for sprouts", desc:"When you see sprouts, start cracking the lid open during warm days and close at night. Harden off for 1–2 weeks before fully removing the top." },
                ].map(step => (
                  <div key={step.n} style={{ display:"flex", gap:10, background:"#fff", borderRadius:12, padding:"10px 12px", marginBottom:8, border:"1.5px solid #e8f5e9", boxShadow:"0 1px 4px #0001" }}>
                    <div style={{ background:"linear-gradient(135deg,#1565c0,#1976d2)", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff", fontWeight:900, fontSize:13 }}>{step.n}</div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:12, color:"#1b5e20", marginBottom:3 }}>{step.icon} {step.title}</div>
                      <div style={{ fontSize:11, color:"#555", lineHeight:1.6 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}

                {/* When to sow by zone */}
                <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:8, marginTop:4 }}>🗺️ When to Start by Zone</div>
                <div style={{ ...card, marginBottom:10 }}>
                  {[
                    { zones:"3–4", when:"November–December", note:"Coldest zones — start early so seeds get enough cold stratification" },
                    { zones:"5–6", when:"December–January", note:"Sweet spot for winter sowing — most seeds do great" },
                    { zones:"7–8", when:"January–February", note:"Mild winters mean less cold stratification but still works well" },
                    { zones:"8b–9", when:"November–January", note:"Use the cooler months — avoid sowing when temps stay above 50°F at night" },
                    { zones:"9–10", when:"October–December", note:"Winter IS your growing season — skip stratification-needing seeds" },
                  ].map((r,i) => (
                    <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom: i < 4 ? "1px solid #f0f0f0" : "none" }}>
                      <div style={{ background:"#e3f2fd", borderRadius:7, padding:"3px 8px", fontSize:10, fontWeight:800, color:"#1565c0", flexShrink:0, alignSelf:"flex-start" }}>Zone {r.zones}</div>
                      <div>
                        <div style={{ fontWeight:800, fontSize:11, color:"#1b5e20" }}>{r.when}</div>
                        <div style={{ fontSize:10, color:"#888", marginTop:1 }}>{r.note}</div>
                      </div>
                    </div>
                  ))}
                  {myZone && (
                    <div style={{ background:`linear-gradient(135deg,${myZone.color},white)`, borderRadius:9, padding:"8px 10px", marginTop:8, fontSize:11, color:myZone.tc, fontWeight:700 }}>
                      {myZone.emoji} You're in Zone {myZone.zone} — best window: {
                        parseFloat(myZone.zone) <= 4 ? "November–December" :
                        parseFloat(myZone.zone) <= 6 ? "December–January" :
                        parseFloat(myZone.zone) <= 8 ? "January–February" :
                        "October–December"
                      }
                    </div>
                  )}
                </div>

                {/* Best plants for winter sowing */}
                <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:8 }}>🌿 Best Plants for Winter Sowing</div>
                <div style={{ ...card, marginBottom:10 }}>
                  {[
                    { emoji:"✅", label:"Easy — perfect for beginners", plants:["Tomatoes","Peppers","Kale","Lettuce","Spinach","Broccoli","Cabbage","Marigolds","Zinnias"] },
                    { emoji:"🌸", label:"Flowers that love cold stratification", plants:["Coneflower","Black-eyed Susan","Columbine","Lavender","Yarrow","Foxglove","Snapdragons"] },
                    { emoji:"🌿", label:"Herbs that winter sow well", plants:["Parsley","Chives","Dill","Cilantro","Chamomile","Lemon balm","Thyme"] },
                    { emoji:"⚠️", label:"Skip these — need warm starts only", plants:["Basil","Cucumbers","Squash","Melons","Sweet potatoes"] },
                  ].map((g,i) => (
                    <div key={i} style={{ marginBottom: i < 3 ? 10 : 0 }}>
                      <div style={{ fontWeight:700, fontSize:10, color: i===3?"#e65100":"#2e7d32", marginBottom:5 }}>{g.emoji} {g.label}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {g.plants.map(p => (
                          <span key={p} style={{ background: i===3?"#fff3e0":"#e8f5e9", color: i===3?"#e65100":"#2e7d32", borderRadius:6, padding:"2px 7px", fontSize:10 }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Jug tracker tip */}
                <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#e3f2fd)", border:"1.5px solid #a5d6a7" }}>
                  <div style={{ fontWeight:800, fontSize:12, color:"#1b5e20", marginBottom:6 }}>🌿 Use the Plant Tracker for your jugs!</div>
                  <div style={{ fontSize:11, color:"#444", lineHeight:1.7 }}>
                    Label each jug with a number on tape, then add it to the Plant Tracker tab with that number. You'll always know what's in Jug #1, Jug #2, and so on — even when they all look the same in February! Tap the Tracker tab to get started.
                  </div>
                  <button onClick={() => setTab("tracker")}
                    style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), marginTop:10, fontSize:11, width:"100%" }}>
                    🌿 Go to Plant Tracker →
                  </button>
                </div>
              </div>
            )}

            {guidesTab === "watering" && WATERING_METHODS.map(m => (
              <button key={m.id} onClick={() => setSelectedWatering(m)}
                style={{ ...card, width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:11, alignItems:"center" }}>
                <span style={{ fontSize:32 }}>{m.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontWeight:900, fontSize:13, color:"#1b5e20" }}>{m.title}</span>
                    <span style={{ ...badge(m.badgeColor,"#fff"), fontSize:9 }}>{m.badge}</span>
                  </div>
                  <div style={{ fontSize:10, color:"#888", marginTop:2 }}>{m.desc.slice(0,55)}…</div>
                </div>
                <span style={{ fontSize:16, color:"#ccc" }}>›</span>
              </button>
            ))}
          </div>
        )}

        {tab === "guides" && selectedGuide && (
          <div>
            <button onClick={() => setSelectedGuide(null)} style={{ ...btn("#e8f5e9","#2e7d32"), marginBottom:10 }}>← Back</button>
            <div style={card}>
              <div style={{ textAlign:"center", fontSize:52 }}>{selectedGuide.emoji}</div>
              <div style={{ textAlign:"center", fontWeight:900, fontSize:18, color:"#1b5e20", marginTop:5 }}>{selectedGuide.name}</div>
              {selectedGuide.indoor && (
                <div style={{ textAlign:"center", marginTop:4, marginBottom:4 }}>
                  <span style={badge(selectedGuide.allergySafe?"#e8f5e9":"#fff3e0", selectedGuide.allergySafe?"#2e7d32":"#e65100")}>
                    {selectedGuide.allergySafe ? "✅ Allergy safe" : "⚠️ Check sensitivities first"}
                  </span>
                  {selectedGuide.allergyNote && <div style={{ fontSize:9, color:"#e65100", marginTop:4 }}>{selectedGuide.allergyNote}</div>}
                </div>
              )}
              {[["📦 Container",selectedGuide.container],["☀️ "+(selectedGuide.indoor?"Light":"Sunlight"), selectedGuide.indoor ? selectedGuide.light : selectedGuide.sun]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1.5px solid #f5f5f5" }}>
                  <span style={{ fontWeight:700, color:"#555", fontSize:12 }}>{k}</span>
                  <span style={{ fontWeight:800, color:"#2e7d32", fontSize:12, textAlign:"right", maxWidth:"55%" }}>{v}</span>
                </div>
              ))}
              <div style={{ padding:"9px 0", borderBottom:"1.5px solid #f5f5f5" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontWeight:700, color:"#555", fontSize:12 }}>💧 Watering</span>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:800, color:"#2e7d32", fontSize:12 }}>{selectedGuide.water}</div>
                    {!selectedGuide.indoor && myZone && (() => { const r=getWateringRange(selectedGuide.waterBase,myZone,selectedGuide.container); return <div style={{ fontSize:10, color:myZone.tc, fontWeight:700 }}>{myZone.emoji} Zone {myZone.zone}: {wLabel(r)}</div>; })()}
                    {selectedGuide.indoor && <div style={{ fontSize:10, color:"#29b6f6", fontWeight:700 }}>🏠 Indoors — no zone adjustment</div>}
                  </div>
                </div>
                <div style={{ fontSize:9, color:"#aaa", marginTop:2 }}>👆 Always finger-test soil 1" before watering</div>
              </div>
              {selectedGuide.indoor && selectedGuide.humidity && (
                <div style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1.5px solid #f5f5f5" }}>
                  <span style={{ fontWeight:700, color:"#555", fontSize:12 }}>💦 Humidity</span>
                  <span style={{ fontWeight:800, color:"#29b6f6", fontSize:12, textAlign:"right", maxWidth:"55%" }}>{selectedGuide.humidity}</span>
                </div>
              )}
              {selectedGuide.indoor && selectedGuide.growLight && (
                <div style={{ background:"#e3f2fd", borderRadius:9, padding:"7px 10px", marginTop:8 }}>
                  <div style={{ fontWeight:800, color:"#1565c0", fontSize:11, marginBottom:2 }}>💡 No sunny window?</div>
                  <div style={{ fontSize:11, color:"#444" }}>{selectedGuide.growLight}</div>
                </div>
              )}
              <div style={{ background:"linear-gradient(135deg,#fffde7,#fff9c4)", borderRadius:10, padding:10, marginTop:10 }}>
                <div style={{ fontWeight:800, color:"#f57f17", fontSize:11, marginBottom:2 }}>{selectedGuide.indoor ? "💡 Indoor Tip" : "💡 Milk Jug Tip"}</div>
                <div style={{ fontSize:11, color:"#555", lineHeight:1.5 }}>{selectedGuide.tip}</div>
              </div>
              {(() => {
                const soil = getSoilRec(null, selectedGuide.name, selectedGuide.container);
                if (!soil) return null;
                return (
                  <div style={{ background:`linear-gradient(135deg,${soil.color},white)`, border:`1.5px solid ${soil.tc}30`, borderRadius:10, padding:"9px 10px", marginTop:10 }}>
                    <div style={{ fontWeight:800, fontSize:11, color:soil.tc, marginBottom:3 }}>🪨 Best Soil: {soil.emoji} {soil.name}</div>
                    <div style={{ fontSize:10, color:"#555", lineHeight:1.5, marginBottom:4 }}>{soil.desc}</div>
                    {soil.brands && <div style={{ fontSize:10, color:"#666", marginBottom:4 }}>🛒 {soil.brands}</div>}
                    <div style={{ background:"#fff3e0", borderRadius:7, padding:"5px 8px", fontSize:10, color:"#e65100", fontWeight:700 }}>⚠️ {soil.avoid}</div>
                  </div>
                );
              })()}
              {selectedGuide.indoor && (
                <button
                  onClick={() => {
                    setNewPlant(p => ({
                      ...p,
                      name: selectedGuide.name,
                      emoji: selectedGuide.emoji,
                      container: selectedGuide.container,
                      waterEvery: selectedGuide.waterBase ? Math.round(selectedGuide.waterBase) : 2,
                      indoor: true,
                    }));
                    setSelectedGuide(null);
                    setTab("garden");
                    setShowAdd(true);
                  }}
                  style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", fontSize:13, padding:13, marginTop:12 }}>
                  🌱 Add {selectedGuide.name} to My Garden
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "guides" && selectedWatering && (
          <div>
            <button onClick={() => setSelectedWatering(null)} style={{ ...btn("#e3f2fd","#1565c0"), marginBottom:10 }}>← Back</button>
            <div style={card}>
              <div style={{ textAlign:"center", fontSize:44 }}>{selectedWatering.emoji}</div>
              <div style={{ textAlign:"center", fontWeight:900, fontSize:17, color:"#1b5e20", marginTop:5 }}>{selectedWatering.title}</div>
              <div style={{ textAlign:"center", marginTop:5 }}><span style={badge(selectedWatering.badgeColor,"#fff")}>{selectedWatering.badge}</span></div>
              <div style={{ background:"#f9fbe7", borderRadius:9, padding:9, marginTop:10, fontSize:11, color:"#444", lineHeight:1.5 }}>{selectedWatering.desc}</div>
              <div style={{ fontWeight:800, fontSize:12, color:"#2e7d32", marginTop:12, marginBottom:6 }}>📋 Steps</div>
              {selectedWatering.steps.map((s,i) => (
                <div key={i} style={{ display:"flex", gap:7, background:"#f5f5f5", borderRadius:9, padding:"7px 9px", marginBottom:5 }}>
                  <span style={{ fontWeight:900, color:"#43a047", flexShrink:0 }}>{i+1}.</span>
                  <span style={{ fontSize:11, color:"#444" }}>{s}</span>
                </div>
              ))}
              <div style={{ background:"linear-gradient(135deg,#fffde7,#fff9c4)", borderRadius:9, padding:9, marginTop:9 }}>
                <div style={{ fontWeight:800, color:"#f57f17", fontSize:11, marginBottom:2 }}>💡 Pro Tip</div>
                <div style={{ fontSize:11, color:"#555" }}>{selectedWatering.tip}</div>
              </div>
              <div style={{ marginTop:9 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#555", marginBottom:4 }}>Best for:</div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{selectedWatering.bestFor.map(c => <span key={c} style={badge("#e3f2fd","#1565c0")}>{c}</span>)}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "guides" && selectedTrouble && (
          <div>
            <button onClick={() => setSelectedTrouble(null)} style={{ ...btn("#ffebee","#c62828"), marginBottom:10 }}>← Back</button>
            <div style={{ ...card, background:`linear-gradient(135deg,${selectedTrouble.color},white)`, border:`2px solid ${selectedTrouble.tc}20` }}>
              <div style={{ textAlign:"center", fontSize:48 }}>{selectedTrouble.emoji}</div>
              <div style={{ textAlign:"center", fontWeight:900, fontSize:17, color:selectedTrouble.tc, marginTop:5 }}>{selectedTrouble.title}</div>
              {selectedTrouble.urgent && (
                <div style={{ textAlign:"center", marginTop:5 }}><span style={badge("#ffebee","#c62828")}>⚡ Act fast — don't wait!</span></div>
              )}
            </div>
            <div style={card}>
              <div style={{ fontWeight:900, fontSize:12, color:"#555", marginBottom:5 }}>👀 What it looks like</div>
              <div style={{ fontSize:11, color:"#444", lineHeight:1.6, background:"#f9f9f9", borderRadius:9, padding:"8px 10px" }}>{selectedTrouble.looks}</div>
            </div>
            <div style={card}>
              <div style={{ fontWeight:900, fontSize:12, color:"#555", marginBottom:5 }}>🤔 Why it happened</div>
              <div style={{ fontSize:11, color:"#444", lineHeight:1.6, background:"#f9f9f9", borderRadius:9, padding:"8px 10px" }}>{selectedTrouble.why}</div>
            </div>
            <div style={card}>
              <div style={{ fontWeight:900, fontSize:12, color:selectedTrouble.tc, marginBottom:8 }}>✅ How to fix it</div>
              {selectedTrouble.fixes.map((f,i) => (
                <div key={i} style={{ display:"flex", gap:9, background:`${selectedTrouble.color}80`, borderRadius:9, padding:"8px 10px", marginBottom:6 }}>
                  <span style={{ fontWeight:900, color:selectedTrouble.tc, flexShrink:0, fontSize:12 }}>{i+1}.</span>
                  <span style={{ fontSize:11, color:"#444", lineHeight:1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TRANSPLANT ══ */}
        {tab === "transplant" && (
          <div>
            {/* Header */}
            <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", borderRadius:18, padding:"18px 16px", marginBottom:12, boxShadow:"0 4px 20px #1b5e2040" }}>
              <div style={{ color:"#fff", fontWeight:900, fontSize:20, marginBottom:4 }}>🌱 Transplant Guides</div>
              <div style={{ color:"#a5d6a7", fontSize:11, lineHeight:1.6 }}>
                Know when to transplant, how to do it step by step, and what to do after. The most critical moment in your plant's life — done right!
              </div>
            </div>

            {/* Free section — when to transplant */}
            <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:8 }}>✅ Free — When to Transplant</div>
            <div style={{ ...card, marginBottom:10 }}>
              <div style={{ fontWeight:800, fontSize:12, color:"#2e7d32", marginBottom:8 }}>🍃 The main signal: True Leaves</div>
              <div style={{ fontSize:11, color:"#444", lineHeight:1.7, marginBottom:10 }}>
                True leaves are the second set of leaves that grow after the first "seed leaves" (cotyledons). They look like the actual plant — tomato-shaped for tomatoes, herb-shaped for herbs.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                {[
                  { emoji:"🌱", label:"1 set of true leaves", status:"Too early", color:"#e3f2fd", tc:"#1565c0" },
                  { emoji:"🍃", label:"2 sets of true leaves", status:"Getting close!", color:"#fff9c4", tc:"#f57f17" },
                  { emoji:"🍃🍃", label:"3 sets of true leaves", status:"Ready! Go for it!", color:"#e8f5e9", tc:"#2e7d32" },
                  { emoji:"🚨", label:"Roots out of holes", status:"Transplant NOW", color:"#ffebee", tc:"#c62828" },
                ].map(s => (
                  <div key={s.label} style={{ background:s.color, borderRadius:10, padding:"9px 10px", border:`1.5px solid ${s.tc}20` }}>
                    <div style={{ fontSize:18, marginBottom:3 }}>{s.emoji}</div>
                    <div style={{ fontWeight:800, fontSize:10, color:s.tc }}>{s.status}</div>
                    <div style={{ fontSize:9, color:s.tc, opacity:0.8, marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#f9fbe7", borderRadius:9, padding:"8px 10px", fontSize:10, color:"#555", lineHeight:1.6 }}>
                💡 <b>Remember:</b> You don't need to check all the boxes. 3 sets of true leaves alone is your green light — go for it!
              </div>
            </div>

            {/* What happens if you wait too long */}
            <div style={{ ...card, marginBottom:12, background:"linear-gradient(135deg,#ffebee,white)", border:"1.5px solid #ffcdd2" }}>
              <div style={{ fontWeight:800, fontSize:12, color:"#c62828", marginBottom:6 }}>⚠️ What happens if you wait too long?</div>
              {[
                "Roots circle the container and strangle themselves (root-bound)",
                "Plant stops growing entirely — stunted for the whole season",
                "Soil dries out within hours every day",
                "Leaves turn yellow from nutrient deficiency",
              ].map((t,i) => (
                <div key={i} style={{ display:"flex", gap:8, fontSize:11, color:"#444", marginBottom:5 }}>
                  <span style={{ color:"#c62828", flexShrink:0 }}>•</span>{t}
                </div>
              ))}
            </div>

            {/* PRO section */}
            <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:8 }}>
              🔒 Transplant Pro — Step-by-Step Guides
              <span style={{ background:"#ff9800", color:"#fff", borderRadius:6, padding:"2px 8px", fontSize:9, fontWeight:800, marginLeft:8 }}>PRO</span>
            </div>

            {TRANSPLANT_GUIDES.map(g => (
              <div key={g.id} style={{ ...card, background:"linear-gradient(135deg,#f9fbe7,white)", border:"1.5px solid #c8e6c9", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:28 }}>{g.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20" }}>{g.name}</div>
                    <div style={{ display:"flex", gap:5, marginTop:3 }}>
                      <span style={{ background:"#e8f5e9", color:"#2e7d32", borderRadius:5, padding:"1px 6px", fontSize:9 }}>📋 {g.steps.length} steps</span>
                      <span style={{ background:"#e3f2fd", color:"#1565c0", borderRadius:5, padding:"1px 6px", fontSize:9 }}>🌿 {g.aftercare.length} aftercare tips</span>
                      <span style={{ background:"#ffebee", color:"#c62828", borderRadius:5, padding:"1px 6px", fontSize:9 }}>⚠️ {g.commonMistakes.length} mistakes</span>
                    </div>
                  </div>
                  <span style={{ background:"#ff9800", color:"#fff", borderRadius:6, padding:"2px 8px", fontSize:9, fontWeight:800 }}>PRO</span>
                </div>

                {/* Free preview */}
                <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:9, padding:"8px 10px", marginBottom:8, fontSize:11, color:"#444", lineHeight:1.5, borderLeft:"3px solid #a5d6a7" }}>
                  💡 {g.freePreview}
                </div>

                {/* Blurred locked steps */}
                <div style={{ position:"relative", overflow:"hidden", borderRadius:9, marginBottom:8 }}>
                  <div style={{ background:"#f5f5f5", padding:"8px 10px", filter:"blur(3px)", userSelect:"none", pointerEvents:"none" }}>
                    {g.steps.slice(0,3).map((s,i) => (
                      <div key={i} style={{ fontSize:10, color:"#444", marginBottom:4 }}>{i+1}. {s.step} — {s.desc.slice(0,40)}...</div>
                    ))}
                  </div>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.5)" }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>🔒</div>
                      <div style={{ fontWeight:800, fontSize:11, color:"#1b5e20" }}>Unlock to read</div>
                    </div>
                  </div>
                </div>

                <button onClick={() => setShowTransplantPro(true)}
                  style={{ ...btn("linear-gradient(135deg,#ff9800,#ff6f00)"), width:"100%", fontSize:12, padding:"10px" }}>
                  🔓 Unlock Full {g.name} Guide
                </button>
              </div>
            ))}

            {/* Coming soon note */}
            <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#e3f2fd)", border:"1.5px solid #a5d6a7", textAlign:"center", padding:"20px" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🚧</div>
              <div style={{ fontWeight:900, fontSize:14, color:"#1b5e20", marginBottom:6 }}>Transplant Pro — Coming Soon!</div>
              <div style={{ fontSize:11, color:"#555", lineHeight:1.6, marginBottom:10 }}>
                Full step-by-step guides for every plant, post-transplant care calendars, hardening off guides, and zone-timed transplant windows.
              </div>
              <div style={{ background:"#fff", borderRadius:9, padding:"10px 12px", fontSize:11, color:"#888" }}>
                🎵 Follow us on TikTok <b style={{ color:"#2e7d32" }}>@lazybriegardening</b> for tips, tutorials and early access announcements!
              </div>
            </div>
          </div>
        )}

        {/* ══ JUG TRACKER ══ */}
        {tab === "tracker" && (
          <div>
            {/* Header */}
            <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", borderRadius:18, padding:"16px 16px 14px", marginBottom:12, boxShadow:"0 4px 20px #1b5e2040" }}>
              <div style={{ color:"#fff", fontWeight:900, fontSize:20, marginBottom:4 }}>🌿 Plant Tracker</div>
              <div style={{ color:"#a5d6a7", fontSize:11, lineHeight:1.6 }}>
                Label your containers with numbers so you always know what's growing in each one — jugs, pots, bags, cans, whatever you're using!
              </div>
            </div>

            {/* How it works tip */}
            <div style={{ ...card, background:"linear-gradient(135deg,#e3f2fd,#e8f5e9)", border:"1.5px solid #90caf9", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:12, color:"#1565c0", marginBottom:6 }}>💡 How to use this</div>
              <div style={{ fontSize:11, color:"#444", lineHeight:1.7 }}>
                Write a number on a piece of tape on each physical container. Log it here when you add a plant. No more mystery pots in the spring! 🌱 Winter sowers love this for labeling milk jugs.
              </div>
            </div>

            {plants.length === 0 ? (
              <div style={{ textAlign:"center", padding:"36px 0", color:"#aaa" }}>
                <div style={{ fontSize:44 }}>🌿</div>
                <div style={{ fontWeight:800, marginTop:8, fontSize:13 }}>No plants tracked yet!</div>
                <div style={{ fontSize:11, marginTop:4 }}>Add a plant with a container label to see it here.</div>
                <button onClick={() => { setTab("garden"); setShowAdd(true); }}
                  style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), marginTop:14, fontSize:12 }}>
                  + Add Your First Plant
                </button>
              </div>
            ) : (
              <>
                {/* Labeled jugs */}
                {(() => {
                  const labeled = plants.filter(p => p.jugNumber);
                  const unlabeled = plants.filter(p => !p.jugNumber);
                  return (
                    <>
                      {labeled.length > 0 && (
                        <>
                          <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", marginBottom:8 }}>
                            🌿 Your Labeled Plants ({labeled.length})
                          </div>
                          {labeled
                            .slice()
                            .sort((a,b) => {
                              const na = isNaN(a.jugNumber) ? a.jugNumber : Number(a.jugNumber);
                              const nb = isNaN(b.jugNumber) ? b.jugNumber : Number(b.jugNumber);
                              return na > nb ? 1 : na < nb ? -1 : 0;
                            })
                            .map(plant => {
                              const days = daysSince(plant.planted);
                              const ts = getTS(plant, days);
                              const ur = UR[ts.urgency];
                              const thirsty = daysSince(plant.lastWatered) >= plant.waterEvery;
                              const sproutMin = plant.sproutMin || 7;
                              const sproutMax = plant.sproutMax || 14;
                              const sprouted = days > sproutMax;
                              const sproutDaysLeft = Math.max(0, sproutMin - days);
                              return (
                                <button key={plant.id} onClick={() => { setSelectedPlant(plant); setTab("garden"); }}
                                  style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", borderRadius:14, padding:"12px 14px", marginBottom:8, width:"100%", textAlign:"left", cursor:"pointer", fontFamily:"inherit", border:thirsty?"2px solid #ff7043":ts.urgency!=="growing"?`2px solid ${ur.border}`:"1.5px solid #e8f5e9", boxShadow:"0 2px 8px #0001" }}>
                                  {/* Jug number badge */}
                                  <div style={{ background:"linear-gradient(135deg,#43a047,#66bb6a)", borderRadius:10, width:48, height:48, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                    <div style={{ color:"rgba(255,255,255,0.7)", fontSize:7, fontWeight:700 }}>JUG</div>
                                    <div style={{ color:"#fff", fontWeight:900, fontSize:18, lineHeight:1 }}>#{plant.jugNumber}</div>
                                  </div>
                                  <div style={{ flex:1 }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                                      <span style={{ fontSize:20 }}>{plant.emoji}</span>
                                      <span style={{ fontWeight:900, fontSize:13, color:"#1b5e20" }}>{plant.name}</span>
                                    </div>
                                    <div style={{ fontSize:10, color:"#888", marginBottom:4 }}>📦 {plant.container} · 🗓 Day {days}{plant.indoor?" · 🏠":""}</div>
                                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                                      {thirsty && <span style={badge("#fff3e0","#ff7043")}>💧 Thirsty!</span>}
                                      {!sprouted && <span style={badge("#e8f5e9","#2e7d32")}>{sproutDaysLeft > 0 ? `🌱 Sprout in ~${sproutDaysLeft}d` : "🌱 Check sprouts!"}</span>}
                                      <span style={{ ...badge(ur.bg,ur.color), border:`1px solid ${ur.border}` }}>{ur.label}</span>
                                    </div>
                                  </div>
                                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                                    <button onClick={ev => { ev.stopPropagation(); waterPlant(plant.id); }}
                                      style={{ ...btn(thirsty?"linear-gradient(135deg,#29b6f6,#4dd0e1)":"#e3f2fd", thirsty?"#fff":"#90a4ae"), padding:"6px 8px", fontSize:16 }}>💧</button>
                                  </div>
                                </button>
                              );
                            })}
                        </>
                      )}

                      {/* Unlabeled plants */}
                      {unlabeled.length > 0 && (
                        <>
                          <div style={{ fontWeight:900, fontSize:13, color:"#888", marginBottom:8, marginTop: labeled.length > 0 ? 12 : 0 }}>
                            📋 Plants Without a Jug Label ({unlabeled.length})
                          </div>
                          <div style={{ ...card, background:"#fff9c4", border:"1.5px solid #f9a825", marginBottom:8, fontSize:11, color:"#666", lineHeight:1.6 }}>
                            💡 These plants don't have a jug number yet. Tap a plant → tap its name in the detail page to edit and add one!
                          </div>
                          {unlabeled.map(plant => (
                            <button key={plant.id} onClick={() => { setSelectedPlant(plant); setTab("garden"); }}
                              style={{ display:"flex", alignItems:"center", gap:10, background:"#fafafa", borderRadius:12, padding:"10px 12px", marginBottom:6, width:"100%", textAlign:"left", cursor:"pointer", fontFamily:"inherit", border:"1.5px solid #e0e0e0" }}>
                              <span style={{ fontSize:24 }}>{plant.emoji}</span>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:800, fontSize:12, color:"#555" }}>{plant.name}</div>
                                <div style={{ fontSize:10, color:"#aaa" }}>📦 {plant.container} · Day {daysSince(plant.planted)}</div>
                              </div>
                              <span style={{ fontSize:11, color:"#ccc" }}>›</span>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}

                {/* Summary stats */}
                <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#f1f8e9)", border:"1.5px solid #a5d6a7", marginTop:8 }}>
                  <div style={{ fontWeight:800, fontSize:12, color:"#2e7d32", marginBottom:8 }}>📊 Garden Summary</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[
                      ["🥛", plants.filter(p=>p.jugNumber).length, "labeled"],
                      ["💧", plants.filter(p=>daysSince(p.lastWatered)>=p.waterEvery).length, "thirsty"],
                      ["🌱", plants.filter(p=>{ const d=daysSince(p.planted); return d>=(p.sproutMin||7)&&d<=(p.sproutMax||14); }).length, "sprouting"],
                    ].map(([icon,val,label]) => (
                      <div key={label} style={{ background:"rgba(255,255,255,0.7)", borderRadius:9, padding:"8px", textAlign:"center" }}>
                        <div style={{ fontSize:18 }}>{icon}</div>
                        <div style={{ fontWeight:900, fontSize:20, color:"#1b5e20" }}>{val}</div>
                        <div style={{ fontSize:9, color:"#888" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ CALCULATOR ══ */}
        {tab === "calc" && (
          <div>
            <div style={{ fontWeight:900, fontSize:15, color:"#2e7d32", marginBottom:2 }}>🧮 Planting Calculator</div>
            <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>Pick container + plant → see how many fit!</div>
            <div style={card}>
              <div style={{ fontWeight:900, color:"#1b5e20", fontSize:12, marginBottom:7 }}>1️⃣ Choose Container</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {CALC_CONTAINERS.map(c => (
                  <button key={c.id} onClick={() => setCalcCont(c)}
                    style={{ background:calcCont?.id===c.id?"linear-gradient(135deg,#43a047,#66bb6a)":"#f5f5f5", color:calcCont?.id===c.id?"#fff":"#444", border:calcCont?.id===c.id?"2px solid #2e7d32":"2px solid #e0e0e0", borderRadius:9, padding:"5px 7px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", minWidth:54 }}>
                    <div style={{ fontSize:17 }}>{c.emoji}</div>
                    <div style={{ fontSize:8, fontWeight:800, lineHeight:1.2 }}>{c.label}</div>
                    {c.volGal && <div style={{ fontSize:8, opacity:0.7 }}>{c.volGal}gal</div>}
                  </button>
                ))}
              </div>
              {calcCont?.id === "custom" && (
                <div style={{ marginTop:9, background:"#f9fbe7", borderRadius:9, padding:9 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                    {[["Diam (in)",cDiam,setCDiam],["Depth (in)",cDepth,setCDepth],["Vol (gal)",cVol,setCVol]].map(([l,v,s]) => (
                      <div key={l}>
                        <div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:2 }}>{l}</div>
                        <input type="number" value={v} onChange={ev => s(ev.target.value)} placeholder="0"
                          style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:6, padding:"5px 5px", fontSize:11, fontFamily:"inherit", boxSizing:"border-box" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {calcCont && calcCont.id !== "custom" && (
                <div style={{ marginTop:7, fontSize:10, color:"#2e7d32", background:"#e8f5e9", borderRadius:7, padding:"4px 7px", display:"flex", gap:9 }}>
                  <span>📦 {calcCont.volGal}gal</span><span>⌀ {calcCont.diamIn}"</span><span>⬇️ {calcCont.depthIn}"</span>
                </div>
              )}
            </div>
            <div style={card}>
              <div style={{ fontWeight:900, color:"#1b5e20", fontSize:12, marginBottom:5 }}>2️⃣ Choose Plant</div>
              {myZone && zonePlants.length > 0 && (
                <>
                  <span style={{ ...badge(myZone.color,myZone.tc), marginBottom:7, display:"inline-block" }}>{myZone.emoji} Zone {myZone.zone} picks</span>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                    {zonePlants.map(p => (
                      <button key={p.id} onClick={() => { setCalcPlant(p); setCustPlantMode(false); }}
                        style={{ background:calcPlant?.id===p.id&&!custPlantMode?"linear-gradient(135deg,#43a047,#66bb6a)":myZone.color, color:calcPlant?.id===p.id&&!custPlantMode?"#fff":myZone.tc, border:calcPlant?.id===p.id&&!custPlantMode?"2px solid #2e7d32":`2px solid ${myZone.tc}30`, borderRadius:9, padding:"5px 7px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", minWidth:52 }}>
                        <div style={{ fontSize:16 }}>{p.emoji}</div>
                        <div style={{ fontSize:8, fontWeight:800 }}>{p.label}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowAllCalc(v => !v)}
                    style={{ background:"transparent", border:"none", color:"#888", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:7 }}>
                    {showAllCalc ? "▲ Hide other plants" : "▼ Show all other plants"}
                  </button>
                </>
              )}
              {(!myZone || showAllCalc) && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:7 }}>
                  {(myZone ? otherCalcPlants : CALC_PLANTS).map(p => (
                    <button key={p.id} onClick={() => { setCalcPlant(p); setCustPlantMode(false); }}
                      style={{ background:calcPlant?.id===p.id&&!custPlantMode?"linear-gradient(135deg,#43a047,#66bb6a)":"#f5f5f5", color:calcPlant?.id===p.id&&!custPlantMode?"#fff":"#444", border:calcPlant?.id===p.id&&!custPlantMode?"2px solid #2e7d32":"2px solid #e0e0e0", borderRadius:9, padding:"5px 7px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", minWidth:52 }}>
                      <div style={{ fontSize:16 }}>{p.emoji}</div>
                      <div style={{ fontSize:8, fontWeight:800 }}>{p.label}</div>
                    </button>
                  ))}
                </div>
              )}
              {!myZone && (
                <div style={{ fontSize:10, color:"#2e7d32", background:"#e8f5e9", borderRadius:7, padding:"4px 7px", marginBottom:7 }}>
                  💡 Set your zone to see climate picks first!{" "}
                  <button onClick={() => setShowZonePicker(true)} style={{ background:"none", border:"none", color:"#43a047", fontWeight:800, cursor:"pointer", fontFamily:"inherit", fontSize:10 }}>Set zone →</button>
                </div>
              )}
              <div style={{ borderTop:"1.5px solid #f0f0f0", paddingTop:7 }}>
                <button onClick={() => setCustPlantMode(v => !v)}
                  style={{ background:custPlantMode?"linear-gradient(135deg,#ff7043,#ff8a65)":"#f5f5f5", color:custPlantMode?"#fff":"#444", border:custPlantMode?"2px solid #e64a19":"2px dashed #ccc", borderRadius:9, padding:"4px 9px", cursor:"pointer", fontFamily:"inherit" }}>
                  ✏️ <span style={{ fontSize:9, fontWeight:800 }}>Custom Plant</span>
                </button>
              </div>
              {custPlantMode && (
                <div style={{ marginTop:9, background:"#fff3e0", borderRadius:10, padding:10, border:"2px solid #ffe0b2" }}>
                  <div style={{ marginBottom:7 }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:2 }}>Plant name</div>
                    <input value={cpName} onChange={ev => setCpName(ev.target.value)} placeholder="e.g. Sunflower"
                      style={{ width:"100%", border:"2px solid #ffe0b2", borderRadius:6, padding:"6px 7px", fontSize:11, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                    {[["Spacing(in)",cpSpacing,setCpSpacing],["Root depth(in)",cpDepth,setCpDepth],["Min vol(gal)",cpMinVol,setCpMinVol]].map(([l,v,s]) => (
                      <div key={l}>
                        <div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:2 }}>{l}</div>
                        <input type="number" value={v} onChange={ev => s(ev.target.value)} placeholder="0"
                          style={{ width:"100%", border:"2px solid #ffe0b2", borderRadius:6, padding:"5px 4px", fontSize:10, fontFamily:"inherit", boxSizing:"border-box" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:9, color:"#aaa", marginTop:5 }}>💡 Check seed packet for spacing & depth.</div>
                </div>
              )}
            </div>
            {calcResult && (
              <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#f1f8e9)", border:"2px solid #a5d6a7" }}>
                <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", textAlign:"center", marginBottom:10 }}>
                  {activePlant?.emoji} {activePlant?.label} in {calcCont?.label} {calcCont?.emoji}
                </div>
                {calcResult.tooShallow || calcResult.tooSmall ? (
                  <div style={{ background:"#ffebee", borderRadius:10, padding:11, textAlign:"center" }}>
                    <div style={{ fontSize:26 }}>⚠️</div>
                    <div style={{ fontWeight:900, color:"#c62828", fontSize:12, marginTop:5 }}>Container Too Small!</div>
                    {calcResult.tooShallow && <div style={{ fontSize:11, color:"#666", marginTop:3 }}>Needs at least <b>{activePlant.rootDepthIn}"</b> depth — this is only <b>{calcResult.depth}"</b></div>}
                    {calcResult.tooSmall   && <div style={{ fontSize:11, color:"#666", marginTop:3 }}>Needs at least <b>{activePlant.minVolGal}gal</b> — this holds <b>{calcResult.vol}gal</b></div>}
                  </div>
                ) : (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:9 }}>
                      {[["🌱","Plants Fit",calcResult.count,calcResult.count===1?"plant":"plants","#e8f5e9","#2e7d32"],
                        ["🪨","Soil",calcResult.soilCups,"cups","#fff3e0","#e65100"],
                        ["📦","Also",calcResult.soilCuFt,"cu ft","#e3f2fd","#1565c0"]].map(([em,lbl,val,unit,bg,col]) => (
                        <div key={lbl} style={{ background:bg, borderRadius:10, padding:"9px 5px", textAlign:"center" }}>
                          <div style={{ fontSize:18 }}>{em}</div>
                          <div style={{ fontWeight:900, fontSize:18, color:col }}>{val}</div>
                          <div style={{ fontSize:9, color:col, fontWeight:700 }}>{unit}</div>
                          <div style={{ fontSize:8, color:"#888" }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:"#fff", borderRadius:9, padding:9, marginBottom:7, fontSize:10, color:"#444" }}>
                      <b>📐</b> {activePlant.spacingIn}" spacing · {activePlant.rootDepthIn}" root depth · {calcResult.vol}gal container
                    </div>
                    <div style={{ background:"linear-gradient(135deg,#fffde7,#fff9c4)", borderRadius:9, padding:"7px 9px", fontSize:10, color:"#555", marginBottom:9 }}>
                      💡 {activePlant.notes}
                    </div>
                    {(() => {
                      const contName = calcCont.label.includes("Milk Jug") ? "Milk Jug"
                        : calcCont.label.includes("Bucket") ? "5-Gal Bucket"
                        : calcCont.label.includes("Fabric") ? "Fabric Bag"
                        : calcCont.label.includes("Coffee") ? "Coffee Can"
                        : calcCont.label.includes("Yogurt") ? "Yogurt Container"
                        : calcCont.label.includes("Basket") ? "Laundry Basket"
                        : "Plastic Pot";
                      const soil = getSoilRec(activePlant.id, activePlant.label, contName);
                      if (!soil) return null;
                      return (
                        <div style={{ background:`linear-gradient(135deg,${soil.color},white)`, border:`1.5px solid ${soil.tc}30`, borderRadius:10, padding:"9px 10px", marginBottom:9 }}>
                          <div style={{ fontWeight:800, fontSize:11, color:soil.tc, marginBottom:3 }}>🪨 Use: {soil.emoji} {soil.name}</div>
                          <div style={{ fontSize:10, color:"#555", lineHeight:1.5, marginBottom:4 }}>{soil.desc}</div>
                          <div style={{ fontSize:9, color:"#e65100", fontWeight:700 }}>⚠️ {soil.avoid}</div>
                        </div>
                      );
                    })()}
                    <button
                      onClick={() => {
                        setNewPlant(p => ({
                          ...p,
                          name: activePlant.label,
                          emoji: activePlant.emoji,
                          container: calcCont.label.includes("Milk Jug") ? "Milk Jug"
                            : calcCont.label.includes("Bucket") ? "5-Gal Bucket"
                            : calcCont.label.includes("Fabric") ? "Fabric Bag"
                            : calcCont.label.includes("Coffee") ? "Coffee Can"
                            : calcCont.label.includes("Yogurt") ? "Yogurt Container"
                            : "Plastic Pot",
                        }));
                        setTab("garden");
                        setShowAdd(true);
                      }}
                      style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", fontSize:12 }}>
                      🌱 Add this plant to My Garden
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ PLANT DETAIL OVERLAY ══ */}
      {selectedPlant && (() => {
        const p      = plants.find(pl => pl.id === selectedPlant.id) || selectedPlant;
        const days   = daysSince(p.planted);
        const wr     = getWateringRange(p.waterEvery, myZone, p.container);
        const ts     = getTS(p, days);
        const ur     = UR[ts.urgency];
        const thirsty= daysSince(p.lastWatered) >= p.waterEvery;
        return (
          <div style={{ position:"fixed", inset:0, zIndex:200, background:"linear-gradient(160deg,#e8f5e9,#fffde7)", maxWidth:480, margin:"0 auto", overflowY:"auto" }}>
            <div style={{ background:"linear-gradient(90deg,#43a047,#66bb6a)", padding:"14px 14px 16px", borderRadius:"0 0 22px 22px", boxShadow:"0 4px 18px #43a04740" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <button onClick={() => setSelectedPlant(null)}
                  style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:7, padding:"4px 9px", color:"#fff", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
                <span style={{ fontSize:38 }}>{p.emoji}</span>
                <div>
                  <div style={{ color:"#fff", fontWeight:900, fontSize:17 }}>{p.name}</div>
                  <div style={{ color:"#c8e6c9", fontSize:10 }}>
                    {p.jugNumber ? `🥛 Jug #${p.jugNumber} · ` : ""}📦 {p.container} · 🗓 {days} days old
                  </div>
                </div>
              </div>
              <div style={{ marginTop:11 }}>
                <div style={{ display:"flex", justifyContent:"space-between", color:"#c8e6c9", fontSize:9, marginBottom:3 }}>
                  <span>Health</span><span>❤️ {p.health}%</span>
                </div>
                <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:7, height:7 }}>
                  <div style={{ height:"100%", width:p.health+"%", background:p.health>70?"#fff":p.health>40?"#ffcc02":"#ff7043", borderRadius:7 }} />
                </div>
              </div>
            </div>
            <div style={{ padding:"12px 12px 60px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:10 }}>
                <div style={{ ...card, background:thirsty?"linear-gradient(135deg,#fff3e0,#ffe0b2)":"#fff", border:thirsty?"2px solid #ff9800":"2px solid #e3f2fd" }}>
                  <div style={{ fontSize:20 }}>💧</div>
                  <div style={{ fontWeight:900, fontSize:11, color:thirsty?"#e65100":"#1565c0", marginTop:4 }}>{thirsty?"Needs water!":"Watered"}</div>
                  <div style={{ fontSize:9, color:"#666" }}>{daysSince(p.lastWatered)}d ago</div>
                  <div style={{ fontSize:9, color:"#888", marginTop:2 }}>Schedule: {wLabel(wr)}</div>
                  <button onClick={() => waterPlant(p.id)} style={{ ...btn("linear-gradient(135deg,#29b6f6,#4dd0e1)"), marginTop:7, padding:"4px 9px", fontSize:10 }}>💧 Water now</button>
                </div>
                <div style={card}>
                  <div style={{ fontSize:20 }}>🗓</div>
                  <div style={{ fontWeight:900, fontSize:11, color:"#2e7d32", marginTop:4 }}>Day {days}</div>
                  <div style={{ fontSize:9, color:"#888" }}>Since planting</div>
                  {myZone && <div style={{ fontSize:9, color:myZone.tc, fontWeight:700, marginTop:2 }}>{myZone.emoji} Zone {myZone.zone}</div>}
                </div>
              </div>

              {/* ── SPROUTED BUTTON ── */}
              {!p.sproutedDate ? (
                <button onClick={() => markSprouted(p.id)}
                  style={{ width:"100%", background:"linear-gradient(135deg,#43a047,#66bb6a)", border:"none", borderRadius:14, padding:"14px", marginBottom:10, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 14px #43a04740" }}>
                  <span style={{ fontSize:28 }}>🌱</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ color:"#fff", fontWeight:900, fontSize:15 }}>Sprouted!</div>
                    <div style={{ color:"#c8e6c9", fontSize:10 }}>Tap when you see the first sprout</div>
                  </div>
                </button>
              ) : (
                <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#f1f8e9)", border:"2px solid #a5d6a7", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:28 }}>🌱</span>
                  <div>
                    <div style={{ fontWeight:900, fontSize:12, color:"#2e7d32" }}>Sprouted on Day {daysSince(p.planted) - daysSince(p.sproutedDate || p.planted) === 0 ? daysSince(p.planted) : (() => { const plantedMs = new Date(p.planted).getTime(); const sproutedMs = new Date(p.sproutedDate).getTime(); return Math.floor((sproutedMs - plantedMs) / 86400000); })()}! 🎉</div>
                    <div style={{ fontSize:10, color:"#666" }}>{new Date(p.sproutedDate + "T12:00:00").toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}</div>
                  </div>
                  <button onClick={() => setPlants(ps => ps.map(pl => pl.id !== p.id ? pl : { ...pl, sproutedDate: null }))}
                    style={{ marginLeft:"auto", background:"none", border:"none", color:"#ccc", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>undo</button>
                </div>
              )}

              {/* Container-specific watering advice */}
              {(() => {
                const advice = CONTAINER_WATERING_ADVICE[p.container];
                if (!advice) return null;
                return (
                  <div style={{ ...card, background:"linear-gradient(135deg,#e3f2fd,#e8f5e9)", border:"2px solid #90caf9", marginBottom:9 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                      <span style={{ fontSize:22 }}>{advice.icon}</span>
                      <div>
                        <div style={{ fontWeight:900, fontSize:12, color:"#1565c0" }}>💧 Watering your {p.container}</div>
                        <div style={{ fontSize:10, color:"#555" }}>{advice.method} · <b style={{ color:"#1976d2" }}>{advice.amount}</b> per session</div>
                      </div>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.75)", borderRadius:9, padding:"8px 10px", fontSize:11, color:"#444", lineHeight:1.6, marginBottom:7 }}>
                      {advice.howTo}
                    </div>
                    <div style={{ background:"#e8f5e9", borderRadius:8, padding:"5px 9px", fontSize:10, color:"#2e7d32", fontWeight:700 }}>
                      {advice.checkMethod}
                    </div>
                  </div>
                );
              })()}

              {/* Soil recommendation */}
              {(() => {
                const soil = getSoilRec(null, p.name, p.container);
                if (!soil) return null;
                return (
                  <div style={{ ...card, background:`linear-gradient(135deg,${soil.color},white)`, border:`1.5px solid ${soil.tc}30`, marginBottom:9 }}>
                    <div style={{ fontWeight:900, fontSize:12, color:soil.tc, marginBottom:5 }}>🪨 Soil: {soil.emoji} {soil.name}</div>
                    <div style={{ fontSize:11, color:"#444", lineHeight:1.5, marginBottom:6 }}>{soil.desc}</div>
                    {soil.brands && <div style={{ fontSize:10, color:"#666", marginBottom:5 }}>🛒 {soil.brands}</div>}
                    <div style={{ background:"#fff3e0", borderRadius:7, padding:"5px 8px", fontSize:10, color:"#e65100", fontWeight:700 }}>⚠️ {soil.avoid}</div>
                  </div>
                );
              })()}

              <div style={{ ...card, background:ur.bg, border:`2px solid ${ur.border}`, marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontWeight:900, fontSize:12, color:ur.color }}>🪴 {ur.label}</div>
                </div>

                {/* Clear primary instruction */}
                <div style={{ background:"rgba(255,255,255,0.8)", borderRadius:9, padding:"8px 11px", marginBottom:10, fontSize:11, color:"#444", lineHeight:1.6 }}>
                  <b style={{ color:"#1b5e20" }}>The main signal:</b> When your plant has <b>2–3 sets of true leaves</b> it's ready to transplant. The other signs below are helpful extras — you don't need all of them!
                </div>

                <div style={{ fontSize:10, color:"#666", marginBottom:8, fontWeight:700 }}>Check off what you see:</div>
                {TRANSPLANT_SIGNS.map(sign => {
                  const checked = (p.transplantSigns||[]).includes(sign.id);
                  const isPrimary = sign.id === "leaves2" || sign.id === "leaves3";
                  return (
                    <div key={sign.id} style={{ marginBottom:6 }}>
                      <button onClick={() => toggleSign(p.id, sign.id)}
                        style={{ display:"flex", alignItems:"center", gap:8, background:checked?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)", border:checked?`2px solid ${ur.border}`:isPrimary?"2px solid #a5d6a7":"2px solid #e0e0e0", borderRadius:10, padding:"8px 10px", cursor:"pointer", width:"100%", textAlign:"left" }}>
                        <span style={{ fontSize:18, flexShrink:0 }}>{checked?"✅":"⬜"}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <span style={{ fontSize:11, fontWeight:checked?800:500, color:checked?ur.color:"#444" }}>{sign.icon} {sign.label}</span>
                            {isPrimary && <span style={{ background:"#e8f5e9", color:"#2e7d32", borderRadius:5, padding:"1px 5px", fontSize:8, fontWeight:800 }}>KEY SIGN</span>}
                          </div>
                          {checked && <div style={{ fontSize:9, color:"#777", marginTop:2, lineHeight:1.4 }}>💡 {sign.tip}</div>}
                        </div>
                      </button>
                    </div>
                  );
                })}

                {ts.urgency !== "growing" && (
                  <div style={{ background:"rgba(255,255,255,0.8)", borderRadius:9, padding:"8px 10px", marginTop:6, fontSize:10, color:"#555" }}>
                    ➡️ Ready for: <b>{ts.next}</b> ({ts.nextVol})
                  </div>
                )}
                {ts.urgency === "growing" && (
                  <div style={{ background:"rgba(255,255,255,0.6)", borderRadius:9, padding:"7px 10px", marginTop:6, fontSize:10, color:"#888" }}>
                    🌱 Keep growing! Check back when you see <b>2 sets of true leaves</b> — that's your green light.
                  </div>
                )}
                <button onClick={() => markTransplanted(p.id)} style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", marginTop:10 }}>✅ Mark as Transplanted</button>
              </div>

              {/* Transplant Pro Teaser */}
              {(ts.urgency === "ready" || ts.urgency === "urgent") && (() => {
                const plantName = p.name.toLowerCase();
                const guide = TRANSPLANT_GUIDES.find(g =>
                  g.matchNames.some(n => plantName.includes(n))
                );
                return (
                  <div style={{ ...card, background:"linear-gradient(135deg,#1b5e20,#2e7d32)", border:"none", marginBottom:9 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
                      <span style={{ fontSize:28 }}>{guide ? guide.emoji : "🪴"}</span>
                      <div>
                        <div style={{ color:"#fff", fontWeight:900, fontSize:13 }}>
                          Ready to transplant your {p.name}?
                        </div>
                        <div style={{ color:"#a5d6a7", fontSize:10, marginTop:2 }}>
                          Move to: <b style={{ color:"#fff" }}>{ts.next}</b> ({ts.nextVol})
                        </div>
                      </div>
                    </div>

                    {/* Free preview tip */}
                    {guide && (
                      <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:10, padding:"9px 11px", marginBottom:10 }}>
                        <div style={{ color:"#c8e6c9", fontSize:9, fontWeight:700, marginBottom:4 }}>💡 FREE TIP</div>
                        <div style={{ color:"#fff", fontSize:11, lineHeight:1.5 }}>{guide.freePreview}</div>
                      </div>
                    )}

                    {/* Paid stub — locked content preview */}
                    <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"11px 12px", marginBottom:10, border:"1.5px solid rgba(255,255,255,0.15)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div style={{ color:"#fff", fontWeight:900, fontSize:12 }}>🌱 Transplant Pro Guide</div>
                        <span style={{ background:"#ff9800", color:"#fff", borderRadius:6, padding:"2px 8px", fontSize:9, fontWeight:800 }}>PRO</span>
                      </div>
                      {guide && guide.steps.slice(0, 2).map((s, i) => (
                        <div key={i} style={{ display:"flex", gap:8, marginBottom:6, opacity: i === 1 ? 0.4 : 1 }}>
                          <span style={{ color:"#a5d6a7", fontWeight:900, fontSize:11, flexShrink:0 }}>{i+1}.</span>
                          <div>
                            <div style={{ color:"#fff", fontSize:11, fontWeight:700 }}>{s.step}</div>
                            {i === 0 && <div style={{ color:"#c8e6c9", fontSize:10, marginTop:1 }}>{s.desc}</div>}
                          </div>
                        </div>
                      ))}
                      {/* Blurred locked steps */}
                      <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:8, padding:"8px 10px", filter:"blur(2px)", pointerEvents:"none", marginBottom:8 }}>
                        <div style={{ color:"#fff", fontSize:10 }}>3. Bury the stem deep...</div>
                        <div style={{ color:"#fff", fontSize:10, marginTop:4 }}>4. Firm soil and water...</div>
                        <div style={{ color:"#fff", fontSize:10, marginTop:4 }}>5. Shade for 3 days...</div>
                      </div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                        {["📋 Step-by-step guide","🌿 Aftercare calendar","⚠️ Common mistakes","🌡️ Zone-specific timing"].map(f => (
                          <span key={f} style={{ background:"rgba(255,255,255,0.1)", borderRadius:6, padding:"3px 7px", fontSize:9, color:"#c8e6c9" }}>{f}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowTransplantPro(true)}
                        style={{ width:"100%", background:"linear-gradient(135deg,#ff9800,#ff6f00)", border:"none", borderRadius:10, padding:"11px", color:"#fff", fontWeight:900, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                        🔓 Unlock Transplant Pro Guide
                      </button>
                    </div>
                    <div style={{ color:"#a5d6a7", fontSize:9, textAlign:"center" }}>Free tip above is yours — unlock the full guide for step-by-step help!</div>
                  </div>
                );
              })()}

              {/* Plant timeline */}
              {(() => {
                const td = TRANSPLANT_MAP[p.container];
                const plantedD = new Date(p.planted);
                const nextWaterD = new Date(p.lastWatered); nextWaterD.setDate(nextWaterD.getDate() + p.waterEvery);
                const sproutMin = p.sproutMin || 7;
                const sproutMax = p.sproutMax || 14;
                const sproutMinD = new Date(plantedD); sproutMinD.setDate(sproutMinD.getDate() + sproutMin);
                const sproutMaxD = new Date(plantedD); sproutMaxD.setDate(sproutMaxD.getDate() + sproutMax);
                const sprouted = daysSince(p.planted) > sproutMax;
                const milestones = [
                  { label:"🌱 Planted", date:p.planted, color:"#43a047", done:true },
                  { label:"💧 Next water", date:nextWaterD.toISOString().split("T")[0], color:"#29b6f6", done:false },
                  ...(p.sproutedDate
                    ? [{ label:"🌱 Sprouted! 🎉", date:p.sproutedDate, color:"#66bb6a", done:true }]
                    : [
                        { label:"🌿 Expected first sprout", date:sproutMinD.toISOString().split("T")[0], color:"#66bb6a", done:sprouted },
                        { label:"🌿 Sprout window closes", date:sproutMaxD.toISOString().split("T")[0], color:"#388e3c", done:sprouted },
                      ]
                  ),
                  ...(td ? [
                    { label:"🪴 Transplant window", date:(() => { const d=new Date(plantedD); d.setDate(d.getDate()+td.daysMin); return d.toISOString().split("T")[0]; })(), color:"#ff9800", done:daysSince(p.planted) >= td.daysMin },
                    { label:"⚠️ Transplant deadline", date:(() => { const d=new Date(plantedD); d.setDate(d.getDate()+td.daysMax); return d.toISOString().split("T")[0]; })(), color:"#f44336", done:daysSince(p.planted) >= td.daysMax },
                  ] : []),
                ].sort((a,b) => a.date.localeCompare(b.date));
                return (
                  <div style={{ ...card, marginBottom:9 }}>
                    <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20", marginBottom:12 }}>🌱 Plant Timeline</div>
                    {!p.sproutedDate && !sprouted && (
                      <div style={{ background:"#e8f5e9", borderRadius:8, padding:"6px 10px", marginBottom:10, fontSize:10, color:"#2e7d32", fontWeight:700 }}>
                        🌱 Sprout expected: Day {sproutMin}–{sproutMax} · {daysSince(p.planted) < sproutMin ? `${sproutMin - daysSince(p.planted)} days to go` : "Check daily!"}
                      </div>
                    )}
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", left:5, top:0, bottom:0, width:2, background:"#e8f5e9", borderRadius:2 }} />
                      {milestones.map((m, i) => {
                        const isPast = m.date <= TODAY;
                        const isToday = m.date === TODAY;
                        // Find any progress note on this date
                        const matchNote = (p.progressLog||[]).find(n => n.date === m.date);
                        return (
                          <div key={i} style={{ position:"relative", paddingLeft:20, marginBottom:12 }}>
                            <div style={{ position:"absolute", left:0, top:3, width:12, height:12, borderRadius:"50%", background:m.done?"#43a047":isPast?m.color:"#e0e0e0", border:`2px solid ${m.done?"#2e7d32":isPast?m.color:"#ccc"}`, zIndex:1 }} />
                            <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                              <div style={{ fontSize:11, fontWeight:700, color:isPast?"#888":"#bbb", minWidth:72, flexShrink:0 }}>
                                {new Date(m.date+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}
                              </div>
                              <div style={{ fontSize:12, fontWeight:900, color:m.done?"#2e7d32":isPast?m.color:"#bbb" }}>
                                {isToday ? "🔵 " : ""}{m.label}
                              </div>
                            </div>
                            {matchNote && (
                              <div style={{ marginLeft:80, marginTop:3, background:"#fafafa", borderRadius:7, padding:"5px 8px", fontSize:10, color:"#666", fontStyle:"italic", borderLeft:"2px solid #c8e6c9" }}>
                                "{matchNote.note}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => setTab("calendar")}
                      style={{ ...btn("#e8f5e9","#2e7d32"), fontSize:10, padding:"5px 10px", marginTop:4 }}>
                      📅 View full calendar →
                    </button>
                  </div>
                );
              })()}

              {/* ── PROGRESS TIMELINE ── */}
              {(() => {
                const log = p.progressLog || [];
                const MOODS = ["🌱","😊","💪","😐","😟","🚨","🌸","🎉","💧","☀️"];
                return (
                  <div style={{ ...card, marginBottom:9 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20" }}>📸 Progress Timeline</div>
                      <button onClick={() => setShowProgressForm(v => !v)}
                        style={{ ...btn(showProgressForm?"#f5f5f5":"linear-gradient(135deg,#43a047,#66bb6a)", showProgressForm?"#888":"#fff"), padding:"5px 11px", fontSize:10 }}>
                        {showProgressForm ? "✕ Cancel" : "+ Add Update"}
                      </button>
                    </div>

                    {/* Add note form */}
                    {showProgressForm && (
                      <div style={{ background:"#f9fbe7", borderRadius:12, padding:"12px", marginBottom:12, border:"1.5px solid #c8e6c9" }}>
                        <div style={{ fontSize:10, fontWeight:700, color:"#555", marginBottom:6 }}>How's your plant doing?</div>
                        {/* Mood picker */}
                        <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                          {MOODS.map(m => (
                            <button key={m} onClick={() => setNewProgressMood(m)}
                              style={{ fontSize:20, background:newProgressMood===m?"#e8f5e9":"transparent", border:newProgressMood===m?"2px solid #43a047":"2px solid transparent", borderRadius:8, padding:"3px 5px", cursor:"pointer" }}>
                              {m}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={newProgressNote}
                          onChange={ev => setNewProgressNote(ev.target.value)}
                          placeholder="e.g. Spotted first true leaves today! Looking healthy and green 🌿"
                          rows={3}
                          style={{ width:"100%", border:"2px solid #c8e6c9", borderRadius:9, padding:"8px 10px", fontSize:11, fontFamily:"inherit", resize:"none", boxSizing:"border-box", outline:"none", lineHeight:1.5 }}
                        />
                        <button
                          onClick={() => addProgressNote(p.id, newProgressNote, newProgressMood)}
                          style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", marginTop:8, fontSize:12 }}>
                          ✅ Save Update
                        </button>
                      </div>
                    )}

                    {/* Timeline entries */}
                    {log.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"20px 0", color:"#bbb" }}>
                        <div style={{ fontSize:32, marginBottom:6 }}>📸</div>
                        <div style={{ fontSize:11, fontWeight:700 }}>No updates yet</div>
                        <div style={{ fontSize:10, marginTop:3 }}>Tap "+ Add Update" to log your first progress note!</div>
                      </div>
                    ) : (
                      <div style={{ position:"relative", paddingLeft:16 }}>
                        {/* Timeline line */}
                        <div style={{ position:"absolute", left:7, top:0, bottom:0, width:2, background:"#e8f5e9", borderRadius:2 }} />
                        {[...log].reverse().map((entry, i) => (
                          <div key={entry.id} style={{ position:"relative", marginBottom:12, paddingLeft:16 }}>
                            {/* Timeline dot */}
                            <div style={{ position:"absolute", left:-9, top:4, width:10, height:10, borderRadius:"50%", background:"#43a047", border:"2px solid #2e7d32" }} />
                            <div style={{ background: i === 0 ? "#f1f8e9" : "#fafafa", borderRadius:10, padding:"9px 11px", border:`1.5px solid ${i === 0 ? "#a5d6a7" : "#f0f0f0"}` }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <span style={{ fontSize:18 }}>{entry.mood}</span>
                                  <div>
                                    <div style={{ fontWeight:800, fontSize:10, color:"#1b5e20" }}>
                                      Day {entry.day}
                                      {i === 0 && <span style={{ background:"#e8f5e9", color:"#2e7d32", borderRadius:5, padding:"1px 5px", fontSize:8, fontWeight:800, marginLeft:5 }}>Latest</span>}
                                    </div>
                                    <div style={{ fontSize:9, color:"#aaa" }}>
                                      {new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                                    </div>
                                  </div>
                                </div>
                                <button onClick={() => deleteProgressNote(p.id, entry.id)}
                                  style={{ background:"none", border:"none", color:"#ddd", fontSize:14, cursor:"pointer", padding:"0 2px", lineHeight:1 }}>✕</button>
                              </div>
                              <div style={{ fontSize:11, color:"#444", lineHeight:1.6 }}>{entry.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {log.length > 0 && (
                      <div style={{ textAlign:"center", marginTop:4, fontSize:10, color:"#bbb" }}>
                        {log.length} update{log.length !== 1 ? "s" : ""} logged 🌱
                      </div>
                    )}
                  </div>
                );
              })()}

              {p.notes ? (
                <div style={{ ...card, fontSize:11, color:"#555" }}>
                  <div style={{ fontWeight:800, color:"#2e7d32", marginBottom:4 }}>📝 Planting Notes</div>
                  {p.notes}
                </div>
              ) : null}
              <button onClick={() => deletePlant(p.id)}
                style={{ ...btn("#ffebee","#c62828"), width:"100%", marginTop:4, border:"2px solid #ffcdd2" }}>
                🗑️ Remove Plant
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── SPROUT CELEBRATION MODAL ── */}
      {sproutCelebration && (
        <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:460, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={() => setSproutCelebration(null)}>
          <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:380, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={ev => ev.stopPropagation()}>
            <style>{`
              @keyframes sproutPop { 0%{transform:scale(0) rotate(-15deg)} 60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0deg)} }
              @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(60px) rotate(360deg);opacity:0} }
              .sprout-emoji { animation: sproutPop 0.6s cubic-bezier(.36,.07,.19,.97) both; }
              .confetti-1 { animation: confettiFall 1.2s ease-in 0.2s both; position:absolute; top:20px; left:20%; font-size:16px; }
              .confetti-2 { animation: confettiFall 1.4s ease-in 0.1s both; position:absolute; top:10px; left:50%; font-size:14px; }
              .confetti-3 { animation: confettiFall 1.1s ease-in 0.3s both; position:absolute; top:15px; right:20%; font-size:18px; }
              .confetti-4 { animation: confettiFall 1.3s ease-in 0.0s both; position:absolute; top:5px; left:35%; font-size:12px; }
              .confetti-5 { animation: confettiFall 1.5s ease-in 0.4s both; position:absolute; top:25px; right:30%; font-size:15px; }
            `}</style>

            {/* Celebration header */}
            <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", padding:"28px 20px 22px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <span className="confetti-1">🌸</span>
              <span className="confetti-2">⭐</span>
              <span className="confetti-3">🎊</span>
              <span className="confetti-4">✨</span>
              <span className="confetti-5">🌼</span>
              <div className="sprout-emoji" style={{ fontSize:64, marginBottom:10 }}>🌱</div>
              <div style={{ color:"#fff", fontWeight:900, fontSize:22, marginBottom:6 }}>It sprouted!!</div>
              <div style={{ color:"#a5d6a7", fontSize:13 }}>
                {sproutCelebration.emoji} <b style={{ color:"#fff" }}>{sproutCelebration.name}</b> has its first sprout!
              </div>
            </div>

            <div style={{ padding:"18px 20px" }}>
              {/* Stats */}
              <div style={{ background:"#e8f5e9", borderRadius:12, padding:"12px 14px", marginBottom:14, textAlign:"center" }}>
                <div style={{ fontWeight:900, fontSize:13, color:"#2e7d32", marginBottom:4 }}>
                  🗓 Day {daysSince(sproutCelebration.planted)} after planting
                </div>
                <div style={{ fontSize:11, color:"#555" }}>
                  Sprouted on {new Date(TODAY+"T12:00:00").toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" })}
                </div>
              </div>

              {/* What to watch for next */}
              <div style={{ background:"#fffde7", borderRadius:12, padding:"12px 14px", marginBottom:14, border:"1.5px solid #f9a825" }}>
                <div style={{ fontWeight:800, fontSize:12, color:"#f57f17", marginBottom:8 }}>🌿 What happens next</div>
                {[
                  "Keep soil moist but not soaked — sprouts are fragile",
                  "Make sure it's getting light — leggy sprouts need more sun",
                  "Look for true leaves in the next 1–2 weeks",
                  "True leaves = almost transplant time! 🪴",
                ].map((t,i) => (
                  <div key={i} style={{ display:"flex", gap:7, fontSize:11, color:"#444", marginBottom:5 }}>
                    <span style={{ color:"#f57f17", flexShrink:0 }}>•</span>{t}
                  </div>
                ))}
              </div>

              {/* Note logged */}
              <div style={{ background:"#f5f5f5", borderRadius:10, padding:"9px 12px", marginBottom:14, fontSize:10, color:"#888" }}>
                ✅ Progress note logged automatically to your timeline!
              </div>

              <button onClick={() => setSproutCelebration(null)}
                style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", fontSize:13, padding:13 }}>
                🌱 Woohoo! Back to my garden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSPLANT CONGRATS MODAL ── */}
      {congratsPlant && (
        <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:450, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={() => setCongratsPlant(null)}>
          <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={ev => ev.stopPropagation()}>

            {/* Celebration header */}
            <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", padding:"24px 20px 20px", textAlign:"center" }}>
              <div style={{ fontSize:52, marginBottom:8 }}>🎉</div>
              <div style={{ color:"#fff", fontWeight:900, fontSize:20, marginBottom:4 }}>
                You transplanted {congratsPlant.emoji} {congratsPlant.name}!
              </div>
              <div style={{ color:"#a5d6a7", fontSize:12, lineHeight:1.5 }}>
                Amazing milestone — your plant just leveled up! 🌱
              </div>
            </div>

            <div style={{ padding:"18px 20px" }}>
              {/* What just happened */}
              <div style={{ background:"#e8f5e9", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
                <div style={{ fontWeight:900, fontSize:12, color:"#2e7d32", marginBottom:6 }}>✅ What was updated</div>
                <div style={{ fontSize:11, color:"#444", lineHeight:1.7 }}>
                  • Planting date reset to today<br/>
                  • Transplant signs cleared<br/>
                  • Health +10 boost applied<br/>
                  • Timeline restarted from Day 1
                </div>
              </div>

              {/* What's next free tip */}
              {(() => {
                const guide = TRANSPLANT_GUIDES.find(g =>
                  g.matchNames.some(n => (congratsPlant.name||"").toLowerCase().includes(n))
                );
                return (
                  <div style={{ background:"#fff9c4", borderRadius:12, padding:"12px 14px", marginBottom:14, border:"1.5px solid #f9a825" }}>
                    <div style={{ fontWeight:900, fontSize:12, color:"#f57f17", marginBottom:5 }}>💡 Free aftercare tip</div>
                    {guide ? (
                      <>
                        <div style={{ fontSize:11, color:"#444", lineHeight:1.6, marginBottom:6 }}>{guide.aftercare[0]}</div>
                        <div style={{ fontSize:10, color:"#888" }}>+ {guide.aftercare.length - 1} more aftercare tips in Transplant Pro →</div>
                      </>
                    ) : (
                      <div style={{ fontSize:11, color:"#444", lineHeight:1.6 }}>
                        Keep out of direct sun for 2–3 days and water gently. Your plant needs time to settle in its new home!
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Pro upsell */}
              <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", borderRadius:12, padding:"14px", marginBottom:14 }}>
                <div style={{ color:"#fff", fontWeight:900, fontSize:13, marginBottom:4 }}>🌱 What happens next?</div>
                <div style={{ color:"#a5d6a7", fontSize:11, lineHeight:1.6, marginBottom:10 }}>
                  Get the full step-by-step aftercare guide — what to do on Day 1, Day 3, Day 7, and beyond. Plus common mistakes to avoid right after transplanting.
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
                  {["🌿 Full aftercare plan","⚠️ Common mistakes","💧 Watering adjustments","🌡️ Recovery signs"].map(f => (
                    <span key={f} style={{ background:"rgba(255,255,255,0.15)", borderRadius:6, padding:"3px 8px", fontSize:9, color:"#c8e6c9" }}>{f}</span>
                  ))}
                </div>
                <button
                  onClick={() => { setCongratsPlant(null); setShowTransplantPro(true); }}
                  style={{ width:"100%", background:"linear-gradient(135deg,#ff9800,#ff6f00)", border:"none", borderRadius:10, padding:"12px", color:"#fff", fontWeight:900, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                  🔓 Unlock Transplant Pro Guide
                </button>
              </div>

              <button onClick={() => setCongratsPlant(null)}
                style={{ width:"100%", background:"#f5f5f5", border:"none", borderRadius:10, padding:"11px", color:"#888", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                I'm good for now — back to my garden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSPLANT PRO MODAL ── */}
      {showTransplantPro && (
        <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:400, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={() => setShowTransplantPro(false)}>
          <div style={{ background:"#fff", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto", paddingBottom:30 }}
            onClick={ev => ev.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg,#1b5e20,#2e7d32)", borderRadius:"22px 22px 0 0", padding:"20px 18px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ color:"#fff", fontWeight:900, fontSize:20 }}>🌱 Transplant Pro</div>
                  <div style={{ color:"#a5d6a7", fontSize:11, marginTop:3 }}>Step-by-step guides for every plant</div>
                </div>
                <button onClick={() => setShowTransplantPro(false)}
                  style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, padding:"4px 10px", color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12 }}>✕</button>
              </div>
              <div style={{ display:"flex", gap:6, marginTop:12, flexWrap:"wrap" }}>
                {["📋 Full step-by-step guides","🌿 Post-transplant care","⚠️ Common mistakes","🌡️ Zone-timed windows","🥵 Hardening off guide","🪴 5 plant guides included"].map(f => (
                  <span key={f} style={{ background:"rgba(255,255,255,0.15)", borderRadius:7, padding:"3px 9px", fontSize:10, color:"#fff" }}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{ padding:"18px 18px 0" }}>
              {/* Guide previews */}
              {TRANSPLANT_GUIDES.map(g => (
                <div key={g.id} style={{ background:"#f9fbe7", borderRadius:12, padding:"12px 14px", marginBottom:10, border:"1.5px solid #c8e6c9" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:24 }}>{g.emoji}</span>
                    <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20" }}>{g.name}</div>
                    <span style={{ background:"#ff9800", color:"#fff", borderRadius:6, padding:"1px 7px", fontSize:9, fontWeight:800, marginLeft:"auto" }}>PRO</span>
                  </div>
                  <div style={{ fontSize:10, color:"#555", marginBottom:6 }}>{g.freePreview}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    <span style={{ background:"#e8f5e9", color:"#2e7d32", borderRadius:5, padding:"2px 6px", fontSize:9 }}>📋 {g.steps.length} steps</span>
                    <span style={{ background:"#e3f2fd", color:"#1565c0", borderRadius:5, padding:"2px 6px", fontSize:9 }}>🌿 {g.aftercare.length} aftercare tips</span>
                    <span style={{ background:"#ffebee", color:"#c62828", borderRadius:5, padding:"2px 6px", fontSize:9 }}>⚠️ {g.commonMistakes.length} mistakes to avoid</span>
                  </div>
                </div>
              ))}

              {/* Coming soon note */}
              <div style={{ background:"linear-gradient(135deg,#e8f5e9,#e3f2fd)", borderRadius:12, padding:"14px", marginBottom:14, border:"1.5px solid #a5d6a7", textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>🚧</div>
                <div style={{ fontWeight:900, fontSize:14, color:"#1b5e20", marginBottom:4 }}>Coming Soon!</div>
                <div style={{ fontSize:11, color:"#555", lineHeight:1.6 }}>Transplant Pro is in development. Want early access or to be notified when it launches?</div>
                <div style={{ marginTop:10, background:"#fff", borderRadius:9, padding:"8px 10px", fontSize:10, color:"#888" }}>
                  🎵 Follow <b style={{ color:"#a5d6a7" }}>@lazybriegardening</b> on TikTok to get notified first!
                </div>
              </div>

              <button onClick={() => setShowTransplantPro(false)}
                style={{ ...btn("#f5f5f5","#888"), width:"100%", fontSize:12, marginBottom:8 }}>
                Close — I'll check back later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INSTALL BANNER ── */}
      {showInstallBanner && (
        <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", width:"calc(100% - 32px)", maxWidth:448, zIndex:350, background:"linear-gradient(135deg,#1b5e20,#2e7d32)", borderRadius:16, padding:"12px 14px", boxShadow:"0 8px 32px rgba(0,0,0,0.25)", display:"flex", alignItems:"center", gap:10 }}>
          <img src="/icon-192.png" style={{ width:36, height:36, borderRadius:"50%", flexShrink:0 }} alt="Lazy Sprout" />
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontWeight:900, fontSize:12 }}>Add Lazy Sprout to your home screen!</div>
            <div style={{ color:"#a5d6a7", fontSize:10, marginTop:1 }}>Get the full app experience 🌱</div>
          </div>
          <button onClick={handleInstall}
            style={{ background:"#fff", border:"none", borderRadius:9, padding:"6px 12px", color:"#2e7d32", fontWeight:900, fontSize:11, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
            Install
          </button>
          <button onClick={() => setShowInstallBanner(false)}
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:16, cursor:"pointer", padding:"0 4px", flexShrink:0 }}>✕</button>
        </div>
      )}

      {/* ── ZONE PICKER SHEET ── */}
      {showZonePicker && (
        <div style={{ position:"fixed", inset:0, background:"#0008", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={() => setShowZonePicker(false)}>
          <div style={{ background:"#fff", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto", paddingBottom:30 }}
            onClick={ev => ev.stopPropagation()}>
            <div style={{ padding:"18px 18px 10px", borderBottom:"1px solid #f0f0f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:900, fontSize:15, color:"#1b5e20" }}>🗺️ Change Growing Zone</div>
              <button onClick={() => setShowZonePicker(false)}
                style={{ background:"#f5f5f5", border:"none", borderRadius:8, padding:"4px 10px", fontSize:12, color:"#888", cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>✕ Close</button>
            </div>
            <div style={{ padding:"14px 18px" }}>
              {myZone && (
                <div style={{ background:`linear-gradient(135deg,${myZone.color},white)`, borderRadius:12, padding:"10px 12px", marginBottom:12, border:`1.5px solid ${myZone.tc}20` }}>
                  <div style={{ fontSize:10, color:"#888", marginBottom:2 }}>Currently set to</div>
                  <div style={{ fontWeight:900, fontSize:14, color:myZone.tc }}>{myZone.emoji} Zone {myZone.zone} · {myZone.region}</div>
                </div>
              )}
              <AutoDetectZone onDetected={(z) => { setMyZone(z); setShowZonePicker(false); }} />
              <div style={{ fontSize:10, color:"#aaa", textAlign:"center", margin:"10px 0 8px" }}>— or pick manually —</div>
              <div style={{ fontSize:10, color:"#888", background:"#e8f5e9", borderRadius:8, padding:"4px 10px", display:"inline-block", marginBottom:12 }}>💡 Not sure? Search "USDA zone [your zip code]"</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                {ZONES.map(z => (
                  <button key={z.zone} onClick={() => { setMyZone(z); setShowZonePicker(false); }}
                    style={{ background:myZone?.zone===z.zone?z.tc:z.color, border:`2px solid ${z.tc}30`, borderRadius:12, padding:"9px 7px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:18 }}>{z.emoji}</span>
                    <div>
                      <div style={{ fontWeight:900, fontSize:12, color:myZone?.zone===z.zone?"#fff":z.tc }}>Zone {z.zone}</div>
                      <div style={{ fontSize:9, color:myZone?.zone===z.zone?"rgba(255,255,255,0.8)":z.tc, opacity:0.8, lineHeight:1.2 }}>{z.temp}</div>
                      <div style={{ fontSize:9, color:myZone?.zone===z.zone?"rgba(255,255,255,0.6)":z.tc, opacity:0.6, lineHeight:1.2 }}>{z.region}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
