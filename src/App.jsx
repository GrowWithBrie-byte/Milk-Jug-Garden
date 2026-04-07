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

const VISUAL_SIGNS = [
  { id:"roots",  label:"Roots poking out of drainage holes",       icon:"🌿" },
  { id:"droop",  label:"Plant wilts quickly after watering",        icon:"😓" },
  { id:"slow",   label:"Growth has slowed or stalled",              icon:"🐌" },
  { id:"leaves4",label:"Has 4+ true leaves (seedlings)",            icon:"🍃" },
  { id:"heavy",  label:"Plant looks top-heavy for its pot",         icon:"⚖️" },
  { id:"dry",    label:"Soil dries out extremely fast",             icon:"🏜️" },
];

const EMOJI_PRESETS = {
  "🍅":{ name:"Tomatoes",    container:"Milk Jug",        waterEvery:2 },
  "🫑":{ name:"Peppers",     container:"Milk Jug",        waterEvery:2 },
  "🥬":{ name:"Lettuce",     container:"Milk Jug",        waterEvery:2 },
  "🌿":{ name:"Basil",       container:"Yogurt Container",waterEvery:2 },
  "🍓":{ name:"Strawberries",container:"Fabric Bag",      waterEvery:1 },
  "🌸":{ name:"Flowers",     container:"Plastic Pot",     waterEvery:2 },
  "🥒":{ name:"Cucumbers",   container:"5-Gal Bucket",    waterEvery:2 },
  "🌱":{ name:"Herbs",       container:"Coffee Can",      waterEvery:2 },
  "🫚":{ name:"Parsley",     container:"Coffee Can",      waterEvery:2 },
  "🌾":{ name:"Cilantro",    container:"Yogurt Container",waterEvery:2 },
  "🫛":{ name:"Dill",        container:"Milk Jug",        waterEvery:2 },
  "🧄":{ name:"Garlic",      container:"5-Gal Bucket",    waterEvery:3 },
  "🧅":{ name:"Green Onions",container:"Milk Jug",        waterEvery:2 },
  "🫖":{ name:"Chamomile",   container:"Yogurt Container",waterEvery:2 },
  "🥔":{ name:"Potatoes",    container:"Laundry Basket",  waterEvery:2 },
  "🍠":{ name:"Sweet Potatoes",container:"5-Gal Bucket",  waterEvery:2 },
  "🪴":{ name:"",            container:"Milk Jug",        waterEvery:2 },
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
  "Mason Jar":        { method:"Tiny careful pours only", amount:"~2–3 tbsp", howTo:"Mason jars have zero drainage so overwatering is a real risk! Use a turkey baster or small spoon to add just 2–3 tbsp at a time. Let the soil dry out between waterings. Add a layer of pebbles at the bottom to help with moisture control.", checkMethod:"👆 Finger test the very top — even slightly damp means wait. When in doubt, skip a day.", icon:"🫙" }, howTo:"Pick up the jug daily — when it feels noticeably lighter, it's time. Pour slowly through the opening until you see a few drops from the drainage holes. If your jug is sealed, watch for slight leaf droop as your other signal.", checkMethod:"🏋️ Lift test — light jug = thirsty", icon:"🥛" },
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

function getTS(plant, days) {
  const td = TRANSPLANT_MAP[plant.container] || { next:"Larger Container", nextVol:"2× current", daysMin:30, daysMax:45 };
  const signs = (plant.transplantSigns || []).length;
  const urgency = days >= td.daysMax || signs >= 3 ? "urgent"
    : (days >= td.daysMin && signs >= 1) || signs >= 2 ? "ready"
    : days >= td.daysMin ? "watch" : "growing";
  return { ...td, urgency, signs };
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

  const [onboarding, setOnboarding] = useState(() => localStorage.getItem('jugGarden_onboarded') === null);
  const [myZone,  setMyZone]  = useState(() => { const s = localStorage.getItem('jugGarden_myZone');  return s ? JSON.parse(s) : null; });
  const [plants,  setPlants]  = useState(() => { const s = localStorage.getItem('jugGarden_plants');  return s ? JSON.parse(s) : [];   });

  const [selectedPlant,    setSelectedPlant]    = useState(null);
  const [showAdd,          setShowAdd]          = useState(false);
  const [newPlant,         setNewPlant]         = useState({ name:"", container:"Milk Jug", waterEvery:2, emoji:"🪴", notes:"", plantedDate:TODAY });
  const [guidesTab,        setGuidesTab]        = useState("plants");
  const [selectedGuide,    setSelectedGuide]    = useState(null);
  const [selectedWatering, setSelectedWatering] = useState(null);
  const [zoneDetail,       setZoneDetail]       = useState(null);
  const [calcCont,         setCalcCont]         = useState(null);
  const [calcPlant,        setCalcPlant]        = useState(null);
  const [cVol,  setCVol]  = useState(""); const [cDiam, setCDiam] = useState(""); const [cDepth, setCDepth] = useState("");
  const [custPlantMode, setCustPlantMode] = useState(false);
  const [cpName, setCpName] = useState(""); const [cpSpacing, setCpSpacing] = useState(""); const [cpDepth, setCpDepth] = useState(""); const [cpMinVol, setCpMinVol] = useState("");
  const [showAllCalc, setShowAllCalc] = useState(false);

  useEffect(() => { localStorage.setItem('jugGarden_plants',  JSON.stringify(plants));  }, [plants]);
  useEffect(() => { localStorage.setItem('jugGarden_myZone',  JSON.stringify(myZone));  }, [myZone]);
  useEffect(() => { if (!onboarding) localStorage.setItem('jugGarden_onboarded', 'true'); }, [onboarding]);

  const waterPlant    = id => setPlants(ps => ps.map(p => p.id === id ? { ...p, lastWatered:TODAY, health:Math.min(100,p.health+15) } : p));
  const toggleSign    = (pid, sid) => setPlants(ps => ps.map(p => { if (p.id!==pid) return p; const s=p.transplantSigns||[]; return { ...p, transplantSigns: s.includes(sid)?s.filter(x=>x!==sid):[...s,sid] }; }));
  const markTransplanted = id => { setPlants(ps => ps.map(p => p.id!==id ? p : { ...p, planted:TODAY, transplantSigns:[], health:Math.min(100,p.health+10), notes:(p.notes?p.notes+" · ":"")+"Transplanted!" })); setSelectedPlant(null); };
  const deletePlant   = id => { setPlants(ps => ps.filter(p => p.id !== id)); setSelectedPlant(null); };
  const addPlant      = () => {
    if (!newPlant.name.trim()) return;
    setPlants(ps => [...ps, { ...newPlant, id:Date.now(), planted:newPlant.plantedDate||TODAY, lastWatered:TODAY, health:100, transplantSigns:[] }]);
    setNewPlant({ name:"", container:"Milk Jug", waterEvery:2, emoji:"🪴", notes:"", plantedDate:TODAY, indoor:false });
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

      {/* ── ONBOARDING ── */}
      {onboarding && (
        <div style={{ position:"fixed", inset:0, zIndex:300, background:"linear-gradient(160deg,#e8f5e9,#fffde7)", overflowY:"auto", maxWidth:480, margin:"0 auto" }}>
          <div style={{ padding:"36px 18px 40px" }}>
            <div style={{ textAlign:"center", marginBottom:22 }}>
              <div style={{ fontSize:52 }}>🪴</div>
              <div style={{ fontWeight:900, fontSize:22, color:"#1b5e20", marginTop:8 }}>Welcome to JugGarden!</div>
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
      <div style={{ background:"linear-gradient(90deg,#43a047,#66bb6a)", padding:"14px 14px 11px", borderRadius:"0 0 22px 22px", boxShadow:"0 4px 18px #43a04740" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ fontSize:30 }}>🪴</span>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontWeight:900, fontSize:18 }}>JugGarden</div>
            <div style={{ color:"#c8e6c9", fontSize:10 }}>Container & Milk Jug Gardening</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
            {thirstyCount > 0 && <span style={{ background:"#ff7043", color:"#fff", borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:800 }}>💧 {thirstyCount} thirsty</span>}
            <button onClick={() => setOnboarding(true)}
              style={{ background:myZone?myZone.color:"rgba(255,255,255,0.25)", color:myZone?myZone.tc:"#fff", border:"none", borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              {myZone ? `${myZone.emoji} Zone ${myZone.zone}` : "🗺️ Set My Zone"}
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display:"flex", background:"#fff", margin:"10px 12px 0", borderRadius:12, padding:3, boxShadow:"0 2px 8px #0001" }}>
        {[["garden","🌱","Garden"],["calendar","📅","Calendar"],["guides","📖","Guides"],["zones","🗺️","Zones"],["calc","🧮","Calc"]].map(([k,icon,label]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex:1, background:tab===k?"linear-gradient(135deg,#43a047,#66bb6a)":"transparent", color:tab===k?"#fff":"#999", border:"none", borderRadius:10, padding:"6px 2px", fontWeight:800, fontSize:9, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
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

            {/* ── TODAY SUMMARY ── */}
            {plants.length > 0 && (
              <div style={{ ...card, background:"linear-gradient(135deg,#1b5e20,#2e7d32)", border:"none", marginBottom:10 }}>
                <div style={{ color:"#a5d6a7", fontSize:10, fontWeight:700, marginBottom:6 }}>
                  📅 {new Date().toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" })}
                </div>
                {thirstyToday.length === 0 && transplantToday.length === 0 ? (
                  <div style={{ color:"#c8e6c9", fontSize:12, fontWeight:700 }}>✅ All plants are happy today!</div>
                ) : (
                  <>
                    {thirstyToday.length > 0 && (
                      <div style={{ marginBottom:6 }}>
                        <div style={{ color:"#81d4fa", fontSize:10, fontWeight:800, marginBottom:4 }}>💧 Needs water today</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {thirstyToday.map(p => (
                            <button key={p.id} onClick={() => setSelectedPlant(p)}
                              style={{ background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"3px 8px", color:"#fff", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                              {p.emoji} {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {transplantToday.length > 0 && (
                      <div>
                        <div style={{ color:"#ffcc80", fontSize:10, fontWeight:800, marginBottom:4 }}>🪴 Ready to transplant</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {transplantToday.map(p => (
                            <button key={p.id} onClick={() => setSelectedPlant(p)}
                              style={{ background:"rgba(255,200,100,0.2)", border:"1.5px solid rgba(255,200,100,0.3)", borderRadius:8, padding:"3px 8px", color:"#ffcc80", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                              {p.emoji} {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <button onClick={() => setTab("calendar")}
                  style={{ marginTop:8, background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"4px 10px", color:"#c8e6c9", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  📅 View full calendar →
                </button>
              </div>
            )}
            {myZone ? (
              <div style={{ ...card, background:`linear-gradient(135deg,${myZone.color},white)`, border:`1.5px solid ${myZone.tc}20`, display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:20 }}>{myZone.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, fontSize:11, color:myZone.tc }}>Zone {myZone.zone} · {myZone.region}</div>
                  <div style={{ fontSize:10, color:"#666" }}>🗓 {myZone.plantingTime}</div>
                </div>
                <button onClick={() => setOnboarding(true)} style={{ ...btn("transparent",myZone.tc), border:`1.5px solid ${myZone.tc}40`, padding:"2px 7px", fontSize:10 }}>Change</button>
              </div>
            ) : (
              <button onClick={() => setOnboarding(true)} style={{ ...card, width:"100%", border:"2px dashed #a5d6a7", display:"flex", alignItems:"center", gap:9, cursor:"pointer", textAlign:"left" }}>
                <span style={{ fontSize:18 }}>🗺️</span>
                <div>
                  <div style={{ fontWeight:800, fontSize:11, color:"#2e7d32" }}>Set your growing zone</div>
                  <div style={{ fontSize:10, color:"#888" }}>Get personalized tips & plant suggestions</div>
                </div>
              </button>
            )}

            {transplantReady.length > 0 && (
              <div style={{ ...card, background:"linear-gradient(135deg,#fff3e0,#ffe0b2)", border:"2px solid #ff9800", display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:20 }}>🪴➡️</span>
                <div>
                  <div style={{ fontWeight:900, fontSize:11, color:"#e65100" }}>{transplantReady.length} plant{transplantReady.length>1?"s":""} ready to transplant!</div>
                  <div style={{ fontSize:10, color:"#bf360c" }}>{transplantReady.map(p=>p.name).join(", ")}</div>
                </div>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
              <div style={{ fontWeight:900, fontSize:15, color:"#2e7d32" }}>My Plants ({plants.length})</div>
              <button onClick={() => setShowAdd(true)} style={btn("linear-gradient(135deg,#ff7043,#ff8a65)")}>+ Add Plant</button>
            </div>

            {plants.map(plant => {
              const days   = daysSince(plant.planted);
              const wr     = getWateringRange(plant.waterEvery, myZone, plant.container);
              const ts     = getTS(plant, days);
              const ur     = UR[ts.urgency];
              const thirsty= daysSince(plant.lastWatered) >= plant.waterEvery;
              return (
                <div key={plant.id} onClick={() => setSelectedPlant(plant)}
                  style={{ ...card, cursor:"pointer", border:thirsty?"2px solid #ff7043":ts.urgency!=="growing"?`2px solid ${ur.border}`:"2px solid #e8f5e9", padding:0, overflow:"hidden" }}>
                  <div style={{ height:4, background:thirsty?"linear-gradient(90deg,#ff7043,#ffb74d)":`linear-gradient(90deg,#43a047,#66bb6a ${plant.health}%,#e0e0e0 ${plant.health}%)` }} />
                  <div style={{ padding:"11px 12px", display:"flex", gap:9, alignItems:"flex-start" }}>
                    <span style={{ fontSize:36 }}>{plant.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:900, fontSize:14, color:"#1b5e20" }}>{plant.name}</div>
                      <div style={{ fontSize:10, color:"#888" }}>📦 {plant.container} · 🗓 {days}d old{plant.indoor ? " · 🏠 Indoor" : " · 🌿 Outdoor"}</div>
                      <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                        <span style={badge(thirsty?"#fff3e0":"#e8f5e9", thirsty?"#ff7043":"#2e7d32")}>{thirsty?"💧 Needs water!":"✅ "+daysSince(plant.lastWatered)+"d ago"}</span>
                        <span style={badge("#e3f2fd","#1565c0")}>💧 {myZone?wLabel(wr)+" (Z"+myZone.zone+")":"every "+plant.waterEvery+"d"}</span>
                        <span style={{ ...badge(ur.bg,ur.color), border:`1px solid ${ur.border}` }}>{ur.label}</span>
                      </div>
                      <div style={{ fontSize:9, color:"#bbb", marginTop:3, fontStyle:"italic" }}>👆 Tap for full details</div>
                    </div>
                    <button onClick={ev => { ev.stopPropagation(); waterPlant(plant.id); }}
                      style={{ ...btn(thirsty?"linear-gradient(135deg,#29b6f6,#4dd0e1)":"#e3f2fd", thirsty?"#fff":"#90a4ae"), padding:"7px 9px", fontSize:17, flexShrink:0 }}>💧</button>
                  </div>
                </div>
              );
            })}

            {plants.length === 0 && (
              <div style={{ textAlign:"center", padding:"36px 0", color:"#aaa" }}>
                <div style={{ fontSize:44 }}>🪴</div>
                <div style={{ fontWeight:800, marginTop:8 }}>No plants yet! Add your first above.</div>
              </div>
            )}

            {showAdd && (
              <div style={{ position:"fixed", inset:0, background:"#0008", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
                onClick={() => setShowAdd(false)}>
                <div style={{ background:"#fff", borderRadius:"22px 22px 0 0", padding:18, width:"100%", maxWidth:480, paddingBottom:34, maxHeight:"86vh", overflowY:"auto" }}
                  onClick={ev => ev.stopPropagation()}>
                  <div style={{ fontWeight:900, fontSize:16, color:"#2e7d32", marginBottom:11 }}>🌱 Add New Plant</div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:5 }}>Quick Pick</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {Object.entries(EMOJI_PRESETS).map(([em, preset]) => (
                        <button key={em} onClick={() => setNewPlant(p => ({ ...p, emoji:em, name:preset.name||p.name, container:preset.container, waterEvery:preset.waterEvery }))}
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
        {tab === "guides" && !selectedGuide && !selectedWatering && (
          <div>
            <div style={{ display:"flex", background:"#fff", borderRadius:11, padding:3, marginBottom:10, gap:3 }}>
              {[["plants","🌿 Plants"],["indoor","🏠 Indoor"],["watering","💧 Watering"]].map(([k,l]) => (
                <button key={k} onClick={() => setGuidesTab(k)}
                  style={{ flex:1, background:guidesTab===k?"linear-gradient(135deg,#29b6f6,#4dd0e1)":"transparent", color:guidesTab===k?"#fff":"#666", border:"none", borderRadius:9, padding:"7px 4px", fontWeight:800, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                  {l}
                </button>
              ))}
            </div>

            {guidesTab === "indoor" && (
              <div>
                {/* Allergy season banner */}
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

                {/* Indoor plant guides */}
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
            {guidesTab === "plants" && (
              <>
                {myZone && <div style={{ ...card, background:`linear-gradient(135deg,${myZone.color},white)`, border:`1.5px solid ${myZone.tc}20`, fontSize:11, color:myZone.tc }}>{myZone.emoji} <b>Zone {myZone.zone}:</b> Best picks — <b>{myZone.plants.slice(0,3).join(", ")}</b></div>}
                <div style={{ ...card, background:"linear-gradient(135deg,#e3f2fd,#bbdefb)", fontSize:11 }}><b>🥛 Milk Jug Tip:</b> Cut drainage holes in the bottom, then cut the top off or a side panel. Great for herbs, lettuce, and small peppers.</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10 }}>
                  {PLANT_GUIDES.map(g => {
                    const match = myZone && myZone.plants.some(z => z.toLowerCase().includes(g.name.toLowerCase().split(" ")[0]) || g.name.toLowerCase().includes(z.toLowerCase()));
                    return (
                      <button key={g.name} onClick={() => setSelectedGuide(g)}
                        style={{ background:"#fff", border:match?`2.5px solid ${myZone.tc}`:"2px solid #e8f5e9", borderRadius:14, padding:"11px 7px", textAlign:"center", cursor:"pointer", fontFamily:"inherit", position:"relative", boxShadow:"0 2px 8px #0001" }}>
                        {match && <div style={{ position:"absolute", top:4, right:4, ...badge(myZone.color,myZone.tc), fontSize:8 }}>{myZone.emoji}</div>}
                        <div style={{ fontSize:34 }}>{g.emoji}</div>
                        <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20", marginTop:4 }}>{g.name}</div>
                        <div style={{ fontSize:9, color:"#888" }}>📦 {g.container}</div>
                      </button>
                    );
                  })}
                </div>
              </>
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

        {/* ══ ZONES ══ */}
        {tab === "zones" && !zoneDetail && (
          <div>
            <div style={{ fontWeight:900, fontSize:15, color:"#2e7d32", marginBottom:4 }}>🗺️ Growing Zones</div>
            <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>Tap your zone for personalized tips!</div>
            <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#c8e6c9)", fontSize:10, color:"#2e7d32", marginBottom:10 }}>💡 Not sure? Search "USDA zone [your zip]"</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              {ZONES.map(z => (
                <button key={z.zone} onClick={() => setZoneDetail(z)}
                  style={{ background:z.color, border:`2px solid ${z.tc}20`, borderRadius:12, padding:"9px 7px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7, boxShadow:"0 2px 7px #0001" }}>
                  <span style={{ fontSize:18 }}>{z.emoji}</span>
                  <div>
                    <div style={{ fontWeight:900, fontSize:12, color:z.tc }}>Zone {z.zone}</div>
                    <div style={{ fontSize:9, color:z.tc, opacity:0.7 }}>{z.temp}</div>
                    <div style={{ fontSize:9, color:z.tc, opacity:0.5 }}>{z.region}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "zones" && zoneDetail && (
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
                  <button onClick={() => setOnboarding(true)} style={{ background:"none", border:"none", color:"#43a047", fontWeight:800, cursor:"pointer", fontFamily:"inherit", fontSize:10 }}>Set zone →</button>
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
                  <div style={{ color:"#c8e6c9", fontSize:10 }}>📦 {p.container} · 🗓 {days} days old</div>
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

              <div style={{ ...card, background:ur.bg, border:`2px solid ${ur.border}`, marginBottom:9 }}>
                <div style={{ fontWeight:900, fontSize:12, color:ur.color, marginBottom:9 }}>🪴 Status: {ur.label}</div>
                <div style={{ fontSize:10, color:"#888", marginBottom:7 }}>Check off signs you observe:</div>
                {VISUAL_SIGNS.map(sign => {
                  const checked = (p.transplantSigns||[]).includes(sign.id);
                  return (
                    <button key={sign.id} onClick={() => toggleSign(p.id, sign.id)}
                      style={{ display:"flex", alignItems:"center", gap:7, background:checked?"#fff3e0":"rgba(255,255,255,0.8)", border:checked?"2px solid #ff9800":"2px solid #e0e0e0", borderRadius:8, padding:"6px 9px", cursor:"pointer", width:"100%", marginBottom:4 }}>
                      <span style={{ fontSize:15 }}>{checked?"✅":"⬜"}</span>
                      <span style={{ fontSize:10 }}>{sign.icon} {sign.label}</span>
                    </button>
                  );
                })}
                {ts.urgency !== "growing" && (
                  <div style={{ background:"rgba(255,255,255,0.8)", borderRadius:8, padding:"7px 9px", marginTop:5, fontSize:10, color:"#555" }}>
                    ➡️ Next: <b>{ts.next}</b> ({ts.nextVol})
                  </div>
                )}
                <button onClick={() => markTransplanted(p.id)} style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", marginTop:10 }}>✅ Mark as Transplanted</button>
              </div>

              {/* Plant timeline */}
              {(() => {
                const td = TRANSPLANT_MAP[p.container];
                const plantedD = new Date(p.planted);
                const nextWaterD = new Date(p.lastWatered); nextWaterD.setDate(nextWaterD.getDate() + p.waterEvery);
                const milestones = [
                  { label:"🌱 Planted", date:p.planted, color:"#43a047", done:true },
                  { label:"💧 Next water", date:nextWaterD.toISOString().split("T")[0], color:"#29b6f6", done:false },
                  ...(td ? [
                    { label:"🪴 Transplant window", date:(() => { const d=new Date(plantedD); d.setDate(d.getDate()+td.daysMin); return d.toISOString().split("T")[0]; })(), color:"#ff9800", done:daysSince(p.planted) >= td.daysMin },
                    { label:"⚠️ Transplant deadline", date:(() => { const d=new Date(plantedD); d.setDate(d.getDate()+td.daysMax); return d.toISOString().split("T")[0]; })(), color:"#f44336", done:daysSince(p.planted) >= td.daysMax },
                  ] : []),
                ].sort((a,b) => a.date.localeCompare(b.date));
                return (
                  <div style={{ ...card, marginBottom:9 }}>
                    <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20", marginBottom:10 }}>📅 Plant Timeline</div>
                    <div style={{ position:"relative", paddingLeft:16 }}>
                      <div style={{ position:"absolute", left:7, top:0, bottom:0, width:2, background:"#e8f5e9", borderRadius:2 }} />
                      {milestones.map((m, i) => (
                        <div key={i} style={{ position:"relative", marginBottom:10, paddingLeft:16 }}>
                          <div style={{ position:"absolute", left:-9, top:2, width:10, height:10, borderRadius:"50%", background:m.done?"#43a047":m.color, border:`2px solid ${m.done?"#2e7d32":m.color}`, boxShadow:`0 0 0 2px ${m.color}20` }} />
                          <div style={{ fontSize:10, fontWeight:800, color:m.done?"#aaa":m.color }}>{m.label}</div>
                          <div style={{ fontSize:9, color:"#999" }}>{new Date(m.date + "T12:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setTab("calendar")}
                      style={{ ...btn("#e8f5e9","#2e7d32"), fontSize:10, padding:"5px 10px", marginTop:4 }}>
                      📅 View in calendar →
                    </button>
                  </div>
                );
              })()}

              {p.notes ? (
                <div style={{ ...card, fontSize:11, color:"#555" }}>
                  <div style={{ fontWeight:800, color:"#2e7d32", marginBottom:4 }}>📝 Notes</div>
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
    </div>
  );
}
