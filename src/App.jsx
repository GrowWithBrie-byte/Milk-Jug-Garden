import { useState, useEffect } from "react";

const TODAY = "2026-03-31";
const todayMs = new Date(TODAY).getTime();
const daysSince = d => Math.max(0, Math.floor((todayMs - new Date(d).getTime()) / 86400000));

const CONTAINER_TYPES = ["Milk Jug","5-Gal Bucket","Plastic Pot","Fabric Bag","Coffee Can","Yogurt Container"];

const TRANSPLANT_MAP = {
  "Yogurt Container":{ next:"Milk Jug",         nextVol:"1 gal",   daysMin:14, daysMax:21 },
  "Coffee Can":      { next:"Plastic Pot",      nextVol:"1–2 gal", daysMin:21, daysMax:35 },
  "Milk Jug":        { next:"5-Gal Bucket",     nextVol:"5 gal",   daysMin:28, daysMax:45 },
  "Plastic Pot":     { next:"5-Gal Bucket",     nextVol:"5 gal",   daysMin:28, daysMax:45 },
  "5-Gal Bucket":    { next:"10-Gal Fabric Bag",nextVol:"10 gal",  daysMin:60, daysMax:90 },
  "Fabric Bag":      { next:"In-Ground/Raised Bed",nextVol:"N/A",  daysMin:60, daysMax:90 },
};

const VISUAL_SIGNS = [
  { id:"roots",  label:"Roots poking out of drainage holes", icon:"🌿" },
  { id:"droop",  label:"Plant wilts quickly after watering",  icon:"😓" },
  { id:"slow",   label:"Growth has slowed or stalled",        icon:"🐌" },
  { id:"leaves4",label:"Has 4+ true leaves (seedlings)",      icon:"🍃" },
  { id:"heavy",  label:"Plant looks top-heavy for its pot",   icon:"⚖️" },
  { id:"dry",    label:"Soil dries out extremely fast",        icon:"🏜️" },
];

const EMOJI_PRESETS = {
  "🍅":{ name:"Tomatoes",    container:"Milk Jug",         waterEvery:2 },
  "🫑":{ name:"Peppers",     container:"Milk Jug",         waterEvery:2 },
  "🥬":{ name:"Lettuce",     container:"Milk Jug",         waterEvery:2 },
  "🌿":{ name:"Basil",       container:"Yogurt Container", waterEvery:2 },
  "🍓":{ name:"Strawberries",container:"Fabric Bag",       waterEvery:1 },
  "🌸":{ name:"Flowers",     container:"Plastic Pot",      waterEvery:2 },
  "🥒":{ name:"Cucumbers",   container:"5-Gal Bucket",     waterEvery:2 },
  "🌱":{ name:"Herbs",       container:"Coffee Can",       waterEvery:2 },
  "🪴":{ name:"",            container:"Milk Jug",         waterEvery:2 },
};

const ZONES = [
  {zone:"1a",temp:"Below -60°F",emoji:"🥶",color:"#b3e5fc",tc:"#01579b",region:"Fairbanks AK",plantingTime:"June only",indoorStart:"April",plants:["Microgreens","Chives","Radishes"],tips:["Grow indoors or in heated greenhouse","Dark jugs absorb heat"]},
  {zone:"1b",temp:"-60°F to -55°F",emoji:"🥶",color:"#b3e5fc",tc:"#01579b",region:"N. Alaska interior",plantingTime:"June–July",indoorStart:"April–May",plants:["Microgreens","Chives","Kale"],tips:["Windowsill jug garden works best","Row covers extend outdoor season"]},
  {zone:"2a",temp:"-55°F to -50°F",emoji:"❄️",color:"#b3e5fc",tc:"#0277bd",region:"Interior Alaska",plantingTime:"Late May–June",indoorStart:"March–April",plants:["Kale","Spinach","Lettuce","Chives"],tips:["Containers warm faster than ground","Plastic wrap over jugs = mini greenhouse"]},
  {zone:"2b",temp:"-50°F to -45°F",emoji:"❄️",color:"#b3e5fc",tc:"#0277bd",region:"N. Minnesota, N. Maine",plantingTime:"May–July",indoorStart:"March",plants:["Lettuce","Spinach","Kale","Peas"],tips:["Cluster jugs for warmth","Choose fast-maturing varieties (45–60 days)"]},
  {zone:"3a",temp:"-45°F to -40°F",emoji:"🌨️",color:"#e1f5fe",tc:"#0288d1",region:"N. Minnesota, Montana",plantingTime:"May–July",indoorStart:"March–April",plants:["Lettuce","Kale","Herbs","Peas","Radishes"],tips:["Dark milk jugs absorb more solar heat","Start tomatoes indoors 10 weeks early"]},
  {zone:"3b",temp:"-40°F to -35°F",emoji:"🌨️",color:"#e1f5fe",tc:"#0288d1",region:"N. Michigan, Vermont",plantingTime:"May–August",indoorStart:"March–April",plants:["Lettuce","Kale","Herbs","Peas"],tips:["Containers on south-facing walls gain heat","Cover on nights below 35°F through May"]},
  {zone:"4a",temp:"-35°F to -30°F",emoji:"🌬️",color:"#dcedc8",tc:"#33691e",region:"Minneapolis, Burlington VT",plantingTime:"Late April–September",indoorStart:"Feb–March",plants:["Tomatoes","Lettuce","Herbs","Beans","Cucumbers"],tips:["Milk jugs great for season extension","Two lettuce harvests: spring and fall"]},
  {zone:"4b",temp:"-30°F to -25°F",emoji:"🌬️",color:"#dcedc8",tc:"#33691e",region:"Madison WI, Bismarck ND",plantingTime:"Late April–September",indoorStart:"Feb–March",plants:["Tomatoes","Peppers","Lettuce","Herbs","Beans"],tips:["Last frost typically mid-May","Use jugs as cloches over seedlings in spring"]},
  {zone:"5a",temp:"-25°F to -20°F",emoji:"🌤️",color:"#c8e6c9",tc:"#2e7d32",region:"Chicago IL, Columbus OH",plantingTime:"April–October",indoorStart:"Late Feb–March",plants:["Tomatoes","Peppers","Basil","Cucumbers","Lettuce","Strawberries"],tips:["Great zone for milk jug gardening!","Two rounds of lettuce: spring and fall","Bottom water jugs in summer heat"]},
  {zone:"5b",temp:"-20°F to -15°F",emoji:"🌤️",color:"#c8e6c9",tc:"#2e7d32",region:"Indianapolis, Boston",plantingTime:"Mid-April–October",indoorStart:"Late Feb",plants:["Tomatoes","Peppers","Basil","Cucumbers","Lettuce","Strawberries","Mint"],tips:["Containers can go out earlier than in-ground","Fall container garden extends into October"]},
  {zone:"6a",temp:"-15°F to -10°F",emoji:"🌿",color:"#a5d6a7",tc:"#1b5e20",region:"St. Louis MO, Louisville KY",plantingTime:"March–November",indoorStart:"January–February",plants:["Tomatoes","Peppers","Eggplant","Herbs","Cucumbers","Strawberries"],tips:["Three seasons: cool spring, hot summer, cool fall","Shade dark containers from afternoon sun in July/Aug"]},
  {zone:"6b",temp:"-10°F to -5°F",emoji:"🌿",color:"#a5d6a7",tc:"#1b5e20",region:"Baltimore MD, Cincinnati OH",plantingTime:"March–November",indoorStart:"January",plants:["Tomatoes","Peppers","Herbs","Squash","Cucumbers","Strawberries"],tips:["Lettuce and kale can overwinter in protected containers","Bottom watering key in warm summer months"]},
  {zone:"7a",temp:"-5°F to 0°F",emoji:"🌻",color:"#fff9c4",tc:"#f57f17",region:"Washington DC, Tulsa OK",plantingTime:"March–November",indoorStart:"January",plants:["Tomatoes","Peppers","Herbs","Squash","Beans","Kale"],tips:["Fall garden (Sept–Nov) incredibly productive","Year-round lettuce & kale in containers"]},
  {zone:"7b",temp:"0°F to 5°F",emoji:"🌻",color:"#fff9c4",tc:"#f57f17",region:"Nashville TN, Charlotte NC",plantingTime:"Feb–December",indoorStart:"December–January",plants:["Tomatoes","Peppers","Herbs","Squash","Beans","Chard"],tips:["Start seeds right after New Year!","Afternoon shade for containers in June–August"]},
  {zone:"8a",temp:"5°F to 10°F",emoji:"☀️",color:"#fff176",tc:"#f57f17",region:"Seattle WA, Dallas TX",plantingTime:"Feb–December",indoorStart:"December–January",plants:["Tomatoes","Peppers","Herbs","Squash","Okra","Chard"],tips:["Light-colored jugs prevent root overheating","Water daily in summer — bottom watering ideal"]},
  {zone:"8b",temp:"10°F to 15°F",emoji:"☀️",color:"#fff176",tc:"#e65100",region:"Savannah GA, Tucson AZ",plantingTime:"Year-round",indoorStart:"Start cool crops outdoors in fall",plants:["Tomatoes","Peppers","Sweet Potatoes","Herbs","Okra","Chard"],tips:["Two full seasons: cool Oct–March & warm March–Sept","White containers a must in summer"]},
  {zone:"9a",temp:"15°F to 20°F",emoji:"🌴",color:"#ffe082",tc:"#e65100",region:"Los Angeles CA, Phoenix AZ",plantingTime:"Year-round",indoorStart:"N/A",plants:["Peppers","Herbs","Citrus","Sweet Potatoes","Okra","Chard"],tips:["Avoid dark containers — they cook roots","Water daily or twice daily June–September","Grow tomatoes Sept–Nov and Feb–May"]},
  {zone:"9b",temp:"20°F to 25°F",emoji:"🌴",color:"#ffe082",tc:"#e65100",region:"Sacramento CA, Tampa FL",plantingTime:"Year-round",indoorStart:"N/A",plants:["Peppers","Herbs","Sweet Potatoes","Okra","Chard","Citrus"],tips:["Self-watering jugs shine here","Cool-season crops Oct–March very productive"]},
  {zone:"10a",temp:"25°F to 30°F",emoji:"🌺",color:"#ffcc80",tc:"#bf360c",region:"Miami FL, S. California coast",plantingTime:"Year-round",indoorStart:"N/A",plants:["Herbs","Peppers","Tropical Fruits","Chard","Sweet Potatoes","Beans"],tips:["White containers only","Tomatoes: grow Oct–April only","Shade containers 11am–3pm in summer"]},
  {zone:"10b",temp:"30°F to 35°F",emoji:"🌺",color:"#ffcc80",tc:"#bf360c",region:"S. Florida tip, Hawaii coastal",plantingTime:"Year-round",indoorStart:"N/A",plants:["Tropical Herbs","Peppers","Sweet Potatoes","Beans","Chard","Okra"],tips:["Self-watering milk jugs ideal","Watch for year-round pests"]},
  {zone:"11a",temp:"35°F to 40°F",emoji:"🌊",color:"#ffab91",tc:"#bf360c",region:"Hawaii lower elevations",plantingTime:"Year-round",indoorStart:"N/A",plants:["Tropical Herbs","Hot Peppers","Sweet Potatoes","Okra","Beans"],tips:["Containers dry out fast — self-watering jugs a must","Shade cloth May–September"]},
  {zone:"11b",temp:"40°F to 45°F",emoji:"🌊",color:"#ffab91",tc:"#b71c1c",region:"Hawaii tropical valleys",plantingTime:"Year-round",indoorStart:"N/A",plants:["Tropical Herbs","Hot Peppers","Sweet Potatoes","Tropical Greens"],tips:["Water twice daily in dry season","Light-colored containers only"]},
  {zone:"12a",temp:"45°F to 50°F",emoji:"🏝️",color:"#f48fb1",tc:"#880e4f",region:"Puerto Rico, Hawaii hottest",plantingTime:"Year-round",indoorStart:"N/A",plants:["Tropical Herbs","Hot Peppers","Okra","Chard","Sweet Potatoes"],tips:["Self-watering containers highly recommended","Shade cloth almost required"]},
  {zone:"12b",temp:"50°F to 55°F",emoji:"🏝️",color:"#f48fb1",tc:"#880e4f",region:"Extreme S. Puerto Rico",plantingTime:"Year-round",indoorStart:"N/A",plants:["Hot Peppers","Okra","Sweet Potatoes","Heat-Tolerant Herbs"],tips:["White-painted containers help","Water twice daily minimum"]},
  {zone:"13a",temp:"55°F to 60°F",emoji:"🌋",color:"#ce93d8",tc:"#6a1b9a",region:"Death Valley CA",plantingTime:"Year-round (shade required)",indoorStart:"N/A",plants:["Hot Peppers","Okra","Sweet Potatoes","Heat-Tolerant Herbs"],tips:["Shade cloth non-negotiable","Grow under pergola or porch"]},
  {zone:"13b",temp:"60°F to 65°F+",emoji:"🌋",color:"#ce93d8",tc:"#4a148c",region:"Hottest US microclimates",plantingTime:"Year-round (shade/indoor only)",indoorStart:"N/A",plants:["Hot Peppers","Heat-Tolerant Herbs","Okra"],tips:["Indoor container gardening more practical","Self-watering systems essential"]},
];

const PLANT_GUIDES = [
  { name:"Tomatoes",    emoji:"🍅", container:"5-Gal Bucket",     water:"Every 1-2 days", waterBase:1.5, sun:"Full sun",    tip:"Cut the top off a milk jug and plant deep — tomatoes love it!" },
  { name:"Lettuce",     emoji:"🥬", container:"Milk Jug",         water:"Every 2 days",   waterBase:2,   sun:"Part shade", tip:"Milk jugs are perfect! Cut the side for a window box effect." },
  { name:"Basil",       emoji:"🌿", container:"Yogurt Container", water:"Every 2-3 days", waterBase:2.5, sun:"Full sun",   tip:"Loves warmth. Keep near a sunny window in a 32oz container." },
  { name:"Peppers",     emoji:"🫑", container:"Milk Jug",         water:"Every 2 days",   waterBase:2,   sun:"Full sun",   tip:"Use a gallon milk jug — one plant per jug, drain holes essential!" },
  { name:"Strawberries",emoji:"🍓", container:"Fabric Bag",       water:"Every day",      waterBase:1,   sun:"Full sun",   tip:"Poke holes in the sides of a jug for a strawberry tower!" },
  { name:"Mint",        emoji:"🌱", container:"Coffee Can",       water:"Every 2 days",   waterBase:2,   sun:"Part shade", tip:"Keep contained — mint spreads! A coffee can is ideal." },
];

const WATERING_METHODS = [
  { id:"bottom", title:"Bottom Watering", emoji:"🥛", badge:"⭐ Best for Milk Jugs", badgeColor:"#43a047",
    desc:"Set jug in a tray with 1–2\" of water. Soil wicks up from below over 20–30 min. Encourages deep roots and keeps leaves dry.",
    steps:["Poke 4–6 drainage holes in the bottom of your jug","Set jug inside a shallow tray or second cut jug","Pour 1–2 inches of water into the tray","Let soak 20–30 min until top inch of soil feels moist","Remove and empty leftover tray water to prevent root rot"],
    tip:"Stick finger 1\" into soil after 30 min — still dry? Add more water to tray.",
    bestFor:["Milk Jug","Coffee Can","Plastic Pot","Yogurt Container"] },
  { id:"top", title:"Top Watering", emoji:"🚿", badge:"Good for Most Containers", badgeColor:"#1976d2",
    desc:"Pour slowly at base of plant until water drains from bottom holes. Best for larger containers.",
    steps:["Ensure container has drainage holes","Use watering can with gentle rose head","Aim at soil base — avoid wetting leaves","Water slowly until drainage from bottom holes","Wait until top 1–2\" dry before watering again"],
    tip:"Water in morning so leaves dry quickly. Avoid watering at night.",
    bestFor:["5-Gal Bucket","Fabric Bag","Plastic Pot"] },
  { id:"self", title:"DIY Self-Watering Jug", emoji:"💡", badge:"Lazy Girl Approved 😄", badgeColor:"#7b1fa2",
    desc:"Turn two milk jugs into a self-watering planter! Bottom jug = reservoir that wicks up to roots.",
    steps:["Cut one milk jug in half — top half is planter, bottom is reservoir","Poke hole in cap, thread cotton fabric strip as wick","Fill top half with potting mix, wick dangling below cap","Flip top half into bottom half like a funnel in a cup","Fill bottom reservoir through spout; top off every few days"],
    tip:"Use a strip of old cotton t-shirt as wick — works great!",
    bestFor:["Milk Jug"] },
];

// Container soil volume data
const SOIL_DATA = {
  "milkjug1": { soilQts:3.4,  soilCuFt:0.13, bagSize:"Small potting mix bag (8qt)" },
  "milkjug2": { soilQts:6.8,  soilCuFt:0.27, bagSize:"Medium potting mix bag (16qt)" },
  "cup8oz":   { soilQts:0.2,  soilCuFt:0.01, bagSize:"Just a handful of potting mix" },
  "cup16oz":  { soilQts:0.4,  soilCuFt:0.02, bagSize:"A couple cups of potting mix" },
  "yogurt32": { soilQts:0.85, soilCuFt:0.03, bagSize:"About 1 quart of potting mix" },
  "can3lb":   { soilQts:1.5,  soilCuFt:0.06, bagSize:"About 1.5 quarts of potting mix" },
  "pot3gal":  { soilQts:10.2, soilCuFt:0.40, bagSize:"Medium bag (16qt) potting mix" },
  "pot5gal":  { soilQts:17,   soilCuFt:0.67, bagSize:"Large bag (25qt) potting mix" },
  "fabric7":  { soilQts:23.8, soilCuFt:0.94, bagSize:"Two large bags (25qt each)" },
};

// Plant → container compatibility
// good: works great | ok: acceptable | bad: not recommended | ugly: avoid completely
const COMPAT = {
  basil:      { "Milk Jug":"good","Yogurt Container":"good","Coffee Can":"good","Plastic Pot":"good","5-Gal Bucket":"ok","Fabric Bag":"ok" },
  mint:       { "Milk Jug":"good","Yogurt Container":"good","Coffee Can":"good","Plastic Pot":"good","5-Gal Bucket":"ok","Fabric Bag":"ok" },
  chives:     { "Milk Jug":"good","Yogurt Container":"good","Coffee Can":"good","Plastic Pot":"good","5-Gal Bucket":"ok","Fabric Bag":"ok" },
  lettuce:    { "Milk Jug":"good","Yogurt Container":"good","Coffee Can":"ok", "Plastic Pot":"good","5-Gal Bucket":"ok","Fabric Bag":"ok" },
  spinach:    { "Milk Jug":"good","Yogurt Container":"good","Coffee Can":"ok", "Plastic Pot":"good","5-Gal Bucket":"ok","Fabric Bag":"ok" },
  radish:     { "Milk Jug":"good","Yogurt Container":"good","Coffee Can":"ok", "Plastic Pot":"good","5-Gal Bucket":"ok","Fabric Bag":"ok" },
  kale:       { "Milk Jug":"ok", "Yogurt Container":"bad", "Coffee Can":"bad","Plastic Pot":"ok", "5-Gal Bucket":"good","Fabric Bag":"good" },
  tomato:     { "Milk Jug":"bad","Yogurt Container":"ugly","Coffee Can":"ugly","Plastic Pot":"ok", "5-Gal Bucket":"good","Fabric Bag":"good" },
  pepper:     { "Milk Jug":"ok", "Yogurt Container":"ugly","Coffee Can":"ugly","Plastic Pot":"ok", "5-Gal Bucket":"good","Fabric Bag":"good" },
  cucumber:   { "Milk Jug":"bad","Yogurt Container":"ugly","Coffee Can":"ugly","Plastic Pot":"bad","5-Gal Bucket":"good","Fabric Bag":"good" },
  beans:      { "Milk Jug":"ok", "Yogurt Container":"bad", "Coffee Can":"bad","Plastic Pot":"good","5-Gal Bucket":"good","Fabric Bag":"good" },
  strawberry: { "Milk Jug":"good","Yogurt Container":"ok", "Coffee Can":"ok", "Plastic Pot":"good","5-Gal Bucket":"good","Fabric Bag":"good" },
  carrot:     { "Milk Jug":"bad","Yogurt Container":"ugly","Coffee Can":"bad","Plastic Pot":"ok", "5-Gal Bucket":"good","Fabric Bag":"bad" },
  micro:      { "Milk Jug":"good","Yogurt Container":"good","Coffee Can":"good","Plastic Pot":"good","5-Gal Bucket":"ok","Fabric Bag":"ok" },
};

const COMPAT_INFO = {
  good:  { emoji:"✅", label:"Great choice!", color:"#2e7d32", bg:"#e8f5e9" },
  ok:    { emoji:"⚠️", label:"Works, not ideal", color:"#e65100", bg:"#fff3e0" },
  bad:   { emoji:"❌", label:"Not recommended", color:"#c62828", bg:"#ffebee" },
  ugly:  { emoji:"🚫", label:"Avoid — won't thrive", color:"#b71c1c", bg:"#ffcdd2" },
};

// Milk Jug Mode plant data
const JUG_PLANTS = [
  { id:"lettuce",    label:"Lettuce",      emoji:"🥬", waterEvery:2, spacingIn:6,  soilQts:3.4, tip:"Cut side panel for a window-box style. Harvest outer leaves and it keeps growing!", compatible:true },
  { id:"basil",      label:"Basil",        emoji:"🌿", waterEvery:2, spacingIn:6,  soilQts:3.4, tip:"One plant per jug. Keep in a sunny spot. Pinch flowers to keep it bushy.", compatible:true },
  { id:"mint",       label:"Mint",         emoji:"🌱", waterEvery:2, spacingIn:4,  soilQts:3.4, tip:"Milk jugs keep mint from spreading. Perfect container crop!", compatible:true },
  { id:"chives",     label:"Chives",       emoji:"🌿", waterEvery:3, spacingIn:3,  soilQts:3.4, tip:"Pack them in! Chives love milk jugs. Snip and they regrow.", compatible:true },
  { id:"spinach",    label:"Spinach",      emoji:"🥗", waterEvery:2, spacingIn:4,  soilQts:3.4, tip:"Cut the top off the jug. Spinach loves the contained moisture.", compatible:true },
  { id:"radish",     label:"Radishes",     emoji:"🌱", waterEvery:2, spacingIn:3,  soilQts:3.4, tip:"Fast growing — ready in 25 days! Great for beginners.", compatible:true },
  { id:"strawberry", label:"Strawberries", emoji:"🍓", waterEvery:1, spacingIn:8,  soilQts:3.4, tip:"Poke holes in the sides for a vertical strawberry tower. 🍓", compatible:true },
  { id:"pepper",     label:"Peppers",      emoji:"🫑", waterEvery:2, spacingIn:12, soilQts:6.8, tip:"Use a 2-gal jug for best results. One plant per jug, full sun.", compatible:"ok" },
  { id:"micro",      label:"Microgreens",  emoji:"🌱", waterEvery:1, spacingIn:0.5,soilQts:3.4, tip:"Cut the top completely off. Sprinkle seeds, keep moist. Ready in 1 week!", compatible:true },
  { id:"tomato",     label:"Tomatoes",     emoji:"🍅", waterEvery:2, spacingIn:18, soilQts:null,tip:"⚠️ Milk jugs are too small for most tomatoes. Use cherry tomato varieties in a 2-gal jug only.", compatible:false },
  { id:"cucumber",   label:"Cucumbers",    emoji:"🥒", waterEvery:2, spacingIn:18, soilQts:null,tip:"🚫 Cucumbers need too much root space for milk jugs. Use a 5-gal bucket instead.", compatible:false },
  { id:"carrot",     label:"Carrots",      emoji:"🥕", waterEvery:2, spacingIn:3,  soilQts:null,tip:"🚫 Milk jugs aren't deep enough for carrots. Try a 5-gal bucket instead.", compatible:false },
  { id:"potato",     label:"Potatoes",     emoji:"🥔", waterEvery:3, spacingIn:12, soilQts:null,tip:"🚫 Potatoes need at least 10 gallons of space. Milk jugs won't work.", compatible:false },
];

const CALC_PLANTS = [
  { id:"basil",      label:"Basil",           emoji:"🌿", spacingIn:6,   rootDepthIn:6,  minVolGal:0.5,  bestContainer:"Milk Jug",      notes:"Great in milk jugs & yogurt tubs" },
  { id:"mint",       label:"Mint",            emoji:"🌱", spacingIn:4,   rootDepthIn:6,  minVolGal:0.5,  bestContainer:"Milk Jug",      notes:"Keep contained — spreads fast!" },
  { id:"chives",     label:"Chives",          emoji:"🌿", spacingIn:3,   rootDepthIn:6,  minVolGal:0.21, bestContainer:"Coffee Can",    notes:"Perfect for coffee cans & cups" },
  { id:"lettuce",    label:"Lettuce",         emoji:"🥬", spacingIn:6,   rootDepthIn:6,  minVolGal:0.5,  bestContainer:"Milk Jug",      notes:"Ideal for milk jugs — cut & come again" },
  { id:"spinach",    label:"Spinach",         emoji:"🥗", spacingIn:4,   rootDepthIn:6,  minVolGal:0.21, bestContainer:"Milk Jug",      notes:"Shallow roots — great for wide trays" },
  { id:"radish",     label:"Radishes",        emoji:"🌱", spacingIn:3,   rootDepthIn:6,  minVolGal:0.21, bestContainer:"Milk Jug",      notes:"Fast grower — great for cups & cans" },
  { id:"kale",       label:"Kale",            emoji:"🥬", spacingIn:12,  rootDepthIn:12, minVolGal:2,    bestContainer:"5-Gal Bucket",  notes:"Needs a 5-gal bucket for best results" },
  { id:"tomato",     label:"Tomato (Bush)",   emoji:"🍅", spacingIn:18,  rootDepthIn:12, minVolGal:5,    bestContainer:"5-Gal Bucket",  notes:"5-gal bucket minimum — 1 plant per container" },
  { id:"pepper",     label:"Peppers",         emoji:"🫑", spacingIn:12,  rootDepthIn:10, minVolGal:2,    bestContainer:"5-Gal Bucket",  notes:"1 plant per 2-gal jug works, 5-gal is best" },
  { id:"cucumber",   label:"Cucumbers",       emoji:"🥒", spacingIn:18,  rootDepthIn:12, minVolGal:5,    bestContainer:"5-Gal Bucket",  notes:"Needs vertical support — great in 5-gal buckets" },
  { id:"beans",      label:"Green Beans",     emoji:"🫘", spacingIn:4,   rootDepthIn:8,  minVolGal:1,    bestContainer:"Plastic Pot",   notes:"Bush variety best for containers" },
  { id:"strawberry", label:"Strawberries",    emoji:"🍓", spacingIn:8,   rootDepthIn:8,  minVolGal:1,    bestContainer:"Milk Jug",      notes:"1 per jug or poke holes for a strawberry tower" },
  { id:"carrot",     label:"Carrots",         emoji:"🥕", spacingIn:3,   rootDepthIn:12, minVolGal:1,    bestContainer:"5-Gal Bucket",  notes:"Need deep containers — milk jugs too shallow!" },
  { id:"potato",     label:"Potatoes",        emoji:"🥔", spacingIn:12,  rootDepthIn:12, minVolGal:10,   bestContainer:"Fabric Bag",    notes:"Need 10+ gallons — NOT for milk jugs!" },
  { id:"micro",      label:"Microgreens",     emoji:"🌱", spacingIn:0.5, rootDepthIn:2,  minVolGal:0.05, bestContainer:"Milk Jug",      notes:"Perfect for seedling trays & plastic cups!" },
];

const CALC_CONTAINERS = [
  { id:"milkjug1", label:"1-Gal Milk Jug",  emoji:"🥛", volGal:1,    diamIn:5,  depthIn:9  },
  { id:"milkjug2", label:"2-Gal Milk Jug",  emoji:"🥛", volGal:2,    diamIn:6,  depthIn:11 },
  { id:"cup8oz",   label:"8oz Cup",          emoji:"🥤", volGal:0.05, diamIn:3,  depthIn:3  },
  { id:"cup16oz",  label:"16oz Cup",         emoji:"🥤", volGal:0.1,  diamIn:4,  depthIn:4  },
  { id:"yogurt32", label:"32oz Yogurt Tub",  emoji:"🫙", volGal:0.21, diamIn:5,  depthIn:5  },
  { id:"can3lb",   label:"3lb Coffee Can",   emoji:"🥫", volGal:0.37, diamIn:6,  depthIn:7  },
  { id:"pot3gal",  label:"3-Gal Pot",        emoji:"🪴", volGal:3,    diamIn:10, depthIn:10 },
  { id:"pot5gal",  label:"5-Gal Bucket",     emoji:"🪣", volGal:5,    diamIn:12, depthIn:12 },
  { id:"fabric7",  label:"7-Gal Fabric Bag", emoji:"👜", volGal:7,    diamIn:14, depthIn:13 },
  { id:"custom",   label:"Custom Size",      emoji:"✏️", volGal:null, diamIn:null, depthIn:null },
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
    vol = parseFloat(cVol) || 0; diam = parseFloat(cDiam) || 0; depth = parseFloat(cDepth) || 0;
    if (!vol && diam && depth) vol = Math.PI * (diam/2)**2 * depth / 231;
  }
  if (!vol || !depth || !diam) return null;
  const tooShallow = depth < plant.rootDepthIn;
  const tooSmall = vol < plant.minVolGal;
  const count = tooShallow || tooSmall ? 0 : Math.max(1, Math.floor(((diam-1)/plant.spacingIn)**2 * 0.7));
  return { count, soilQts: Math.round(vol*4*0.85*10)/10, soilCuFt: Math.round(vol*0.134*0.85*10)/10, tooShallow, tooSmall, vol: Math.round(vol*10)/10, depth };
}

const UR = {
  urgent:{ bg:"#fff3e0", border:"#ff9800", color:"#ff6f00", label:"🚨 Transplant now!" },
  ready: { bg:"#fffde7", border:"#fdd835", color:"#f9a825", label:"🪴 Ready to transplant" },
  watch: { bg:"#f9fbe7", border:"#aed581", color:"#689f38", label:"👀 Watch for signs" },
  growing:{ bg:"#e8f5e9", border:"#a5d6a7", color:"#388e3c", label:"🌱 Growing" },
};

const card = { background:"#fff", borderRadius:16, padding:13, marginBottom:10, boxShadow:"0 2px 10px #0001" };
const btn = (bg, c="#fff", extra={}) => ({ background:bg, color:c, border:"none", borderRadius:11, padding:"9px 14px", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit", ...extra });
const badge = (bg, c) => ({ background:bg, color:c, borderRadius:8, padding:"2px 7px", fontSize:10, fontWeight:700, display:"inline-block" });

const INIT = [
  { id:1, name:"Cherry Tomatoes", container:"Milk Jug",         planted:"2026-03-01", lastWatered:"2026-03-30", waterEvery:2, emoji:"🍅", health:90, notes:"Doing great!", transplantSigns:[] },
  { id:2, name:"Sweet Basil",     container:"Yogurt Container", planted:"2026-03-10", lastWatered:"2026-03-29", waterEvery:2, emoji:"🌿", health:75, notes:"Smells amazing", transplantSigns:[] },
];

export default function App() {
  const [tab, setTab] = useState("garden");
  const [myZone, setMyZone] = useState(null);
  const [onboarding, setOnboarding] = useState(true);
  const [myZone, setMyZone] = useState(null);
  const [plants, setPlants] = useState(INIT);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [newPlant, setNewPlant] = useState({ name:"", container:"Milk Jug", waterEvery:2, emoji:"🪴", notes:"" });
  const [guidesTab, setGuidesTab] = useState("plants");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedWatering, setSelectedWatering] = useState(null);
  const [zoneDetail, setZoneDetail] = useState(null);
  const [calcCont, setCalcCont] = useState(null);
  const [calcPlant, setCalcPlant] = useState(null);
  const [cVol, setCVol] = useState(""); const [cDiam, setCDiam] = useState(""); const [cDepth, setCDepth] = useState("");
  const [custPlantMode, setCustPlantMode] = useState(false);
  const [cpName, setCpName] = useState(""); const [cpSpacing, setCpSpacing] = useState(""); const [cpDepth, setCpDepth] = useState(""); const [cpMinVol, setCpMinVol] = useState("");
  const [showAllCalc, setShowAllCalc] = useState(false);
  const [zoneDetecting, setZoneDetecting] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [jugPlantFilter, setJugPlantFilter] = useState("all"); // "all" | "good" | "bad"

  const waterPlant = id => setPlants(ps => ps.map(p => p.id === id ? { ...p, lastWatered:TODAY, health:Math.min(100, p.health+15) } : p));
  const toggleSign = (pid, sid) => setPlants(ps => ps.map(p => { if (p.id !== pid) return p; const s = p.transplantSigns||[]; return { ...p, transplantSigns: s.includes(sid) ? s.filter(x=>x!==sid) : [...s,sid] }; }));
  const markTransplanted = id => { setPlants(ps => ps.map(p => p.id!==id ? p : { ...p, planted:TODAY, transplantSigns:[], health:Math.min(100,p.health+10), notes:(p.notes?p.notes+" · ":"")+"Transplanted!" })); setSelectedPlant(null); };
  const addPlant = () => { if (!newPlant.name.trim()) return; setPlants(ps => [...ps, { ...newPlant, id:Date.now(), planted:TODAY, lastWatered:TODAY, health:100, transplantSigns:[] }]); setNewPlant({ name:"",container:"Milk Jug",waterEvery:2,emoji:"🪴",notes:"" }); setShowAdd(false); setCustomMode(false); };
  const deletePlant = id => { if (window.confirm("🗑 Are you sure you want to delete this plant? This can't be undone.")) { setPlants(ps => ps.filter(p => p.id !== id)); setSelectedPlant(null); } };
  const saveEdit = () => { if (!editingPlant) return; setPlants(ps => ps.map(p => p.id === editingPlant.id ? editingPlant : p)); setSelectedPlant(editingPlant); setEditingPlant(null); };

  const detectZone = async () => {
    setZoneDetecting(true);
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const state = data.region || "";
      const found = ZONES.find(z => z.region.toLowerCase().includes(state.toLowerCase()));
      if (found) { setMyZone(found); setOnboarding(false); }
      else alert("Couldn't detect your zone automatically. Please pick it from the list!");
    } catch { alert("Location lookup failed. Please pick your zone from the list!"); }
    setZoneDetecting(false);
  };

  const thirstyCount = plants.filter(p=>daysSince(p.lastWatered)>=p.waterEvery).length;
  const transplantReady = plants.filter(p=>{ const ts=getTS(p,daysSince(p.planted)); return ts.urgency==="ready"||ts.urgency==="urgent"; });

  const zoneNames = myZone ? myZone.plants.map(n=>n.toLowerCase()) : [];
  const zonePlants = myZone ? CALC_PLANTS.filter(p=>zoneNames.some(z=>p.label.toLowerCase().includes(z.split(" ")[0])||z.includes(p.label.toLowerCase().split(" ")[0]))) : [];
  const otherCalcPlants = myZone ? CALC_PLANTS.filter(p=>!zonePlants.includes(p)) : CALC_PLANTS;
  const activePlant = custPlantMode ? { id:"custom", label:cpName||"My Plant", emoji:"🌱", spacingIn:parseFloat(cpSpacing)||0, rootDepthIn:parseFloat(cpDepth)||0, minVolGal:parseFloat(cpMinVol)||0, notes:"Custom plant — check seed packet." } : calcPlant;
  const calcResult = calcCont && activePlant ? calcFit(calcCont, activePlant, cVol, cDiam, cDepth) : null;

  if (!myZone) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#c8e6c9,#e8f5e9,#fffde7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Nunito, sans-serif",
      padding: 20
    }}>

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#ffffff",
        borderRadius: 20,
        padding: 25,
        boxShadow: "0 15px 40px rgba(0,0,0,0.15)"
      }}>

        <div style={{textAlign:"center", marginBottom:20}}>
          <div style={{fontSize:38}}>🌱</div>
          <div style={{fontWeight:900,fontSize:22}}>
            Container Garden Companion
          </div>
          <div style={{fontSize:13,color:"#666"}}>
            Choose your growing zone
          </div>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:10,
          maxHeight:350,
          overflowY:"auto"
        }}>
          {ZONES.map(z => (
            <button
              key={z.zone}
              onClick={() => setMyZone(z)}
              style={{
                background:z.color,
                border:"none",
                borderRadius:12,
                padding:12,
                cursor:"pointer",
                textAlign:"left",
                boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{fontSize:18}}>
                {z.emoji} Zone {z.zone}
              </div>

              <div style={{
                fontSize:11,
                color:z.tc
              }}>
                {z.region}
              </div>

              <div style={{
                fontSize:10,
                color:"#555",
                marginTop:3
              }}>
                {z.temp}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={()=>{
            const guess = ZONES.find(z=>z.zone==="8b") || ZONES[0]
            setMyZone(guess)
          }}
          style={{
            marginTop:18,
            width:"100%",
            padding:12,
            borderRadius:12,
            border:"none",
            background:"linear-gradient(135deg,#66bb6a,#43a047)",
            color:"#fff",
            fontWeight:800,
            cursor:"pointer"
          }}
        >
          📍 Auto Detect (Best Guess)
        </button>

      </div>
    </div>
  )
}

  return (
    <div style={{ fontFamily:"'Nunito',cursive", background:"linear-gradient(135deg,#fffde7,#e8f5e9,#e3f2fd)", minHeight:"100vh", maxWidth:480, margin:"0 auto", position:"relative" }}>

      {/* ONBOARDING */}
      {onboarding && (
        <div style={{ position:"fixed", inset:0, zIndex:300, background:"linear-gradient(160deg,#e8f5e9,#fffde7)", overflowY:"auto", maxWidth:480, margin:"0 auto" }}>
          <div style={{ padding:"36px 18px 40px" }}>
            <div style={{ textAlign:"center", marginBottom:22 }}>
              <div style={{ fontSize:52 }}>🪴</div>
              <div style={{ fontWeight:900, fontSize:22, color:"#1b5e20", marginTop:8 }}>Welcome to JugGarden!</div>
              <div style={{ fontSize:12, color:"#666", marginTop:5, lineHeight:1.5 }}>Pick your <b>USDA Hardiness Zone</b> to personalize everything for your climate.</div>
              <div style={{ fontSize:10, color:"#888", background:"#e8f5e9", borderRadius:8, padding:"4px 10px", display:"inline-block", marginTop:6 }}>💡 Not sure? Search "USDA zone [your zip code]"</div>
            </div>
            <div style={{ fontWeight:800, color:"#2e7d32", fontSize:12, marginBottom:8 }}>🗺️ Select Your Zone:</div>
            <button onClick={detectZone} disabled={zoneDetecting} style={{ width:"100%", background:"linear-gradient(135deg,#43a047,#66bb6a)", color:"#fff", border:"none", borderRadius:12, padding:"12px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:12 }}>
              {zoneDetecting ? "🔍 Detecting your location…" : "🌎 Auto-Detect My Zone"}
            </button>
            <div style={{ textAlign:"center", fontSize:10, color:"#aaa", marginBottom:10 }}>— or pick manually below —</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:14 }}>
              {ZONES.map(z => (
                <button key={z.zone} onClick={()=>{setMyZone(z);setOnboarding(false);}} style={{ background:z.color, border:`2px solid ${z.tc}20`, borderRadius:12, padding:"9px 7px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:18 }}>{z.emoji}</span>
                  <div>
                    <div style={{ fontWeight:900, fontSize:12, color:z.tc }}>Zone {z.zone}</div>
                    <div style={{ fontSize:9, color:z.tc, opacity:0.7, lineHeight:1.2 }}>{z.temp}</div>
                    <div style={{ fontSize:9, color:z.tc, opacity:0.5, lineHeight:1.2 }}>{z.region}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={()=>setOnboarding(false)} style={{ width:"100%", background:"transparent", border:"none", color:"#aaa", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Skip for now</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"linear-gradient(90deg,#43a047,#66bb6a)", padding:"14px 14px 11px", borderRadius:"0 0 22px 22px", boxShadow:"0 4px 18px #43a04740" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ fontSize:30 }}>🪴</span>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontWeight:900, fontSize:18 }}>JugGarden</div>
            <div style={{ color:"#c8e6c9", fontSize:10 }}>Container & Milk Jug Gardening</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
            {thirstyCount > 0 && <span style={{ background:"#ff7043", color:"#fff", borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:800 }}>💧 {thirstyCount} thirsty</span>}
            <button onClick={()=>setOnboarding(true)} style={{ background: myZone?myZone.color:"rgba(255,255,255,0.25)", color: myZone?myZone.tc:"#fff", border:"none", borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              {myZone ? `${myZone.emoji} Zone ${myZone.zone}` : "🗺️ Set My Zone"}
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", background:"#fff", margin:"10px 12px 0", borderRadius:12, padding:3, boxShadow:"0 2px 8px #0001" }}>
        {[["garden","🌱"],["guides","📖"],["zones","🗺️"],["jug","🥛"],["calc","🧮"]].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)} style={{ flex:1, background:tab===k?"linear-gradient(135deg,#43a047,#66bb6a)":"transparent", color:tab===k?"#fff":"#999", border:"none", borderRadius:10, padding:"8px 2px", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:"10px 12px 80px" }}>

        {/* ── MY GARDEN ── */}
        {tab==="garden" && (
          <div>
            {myZone ? (
              <div style={{ ...card, background:`linear-gradient(135deg,${myZone.color},white)`, border:`1.5px solid ${myZone.tc}20`, display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:20 }}>{myZone.emoji}</span>
                <div style={{ flex:1 }}><div style={{ fontWeight:900, fontSize:11, color:myZone.tc }}>Zone {myZone.zone} · {myZone.region}</div><div style={{ fontSize:10, color:"#666" }}>🗓 {myZone.plantingTime}</div></div>
                <button onClick={()=>setOnboarding(true)} style={{ ...btn("transparent",myZone.tc), border:`1.5px solid ${myZone.tc}40`, padding:"2px 7px", fontSize:10 }}>Change</button>
              </div>
            ) : (
              <button onClick={()=>setOnboarding(true)} style={{ ...card, width:"100%", border:"2px dashed #a5d6a7", display:"flex", alignItems:"center", gap:9, cursor:"pointer", textAlign:"left" }}>
                <span style={{ fontSize:18 }}>🗺️</span><div><div style={{ fontWeight:800, fontSize:11, color:"#2e7d32" }}>Set your growing zone</div><div style={{ fontSize:10, color:"#888" }}>Get personalized tips & plant suggestions</div></div>
              </button>
            )}

            {transplantReady.length>0 && (
              <div style={{ ...card, background:"linear-gradient(135deg,#fff3e0,#ffe0b2)", border:"2px solid #ff9800", display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:20 }}>🪴➡️</span>
                <div><div style={{ fontWeight:900, fontSize:11, color:"#e65100" }}>{transplantReady.length} plant{transplantReady.length>1?"s":""} ready to transplant!</div><div style={{ fontSize:10, color:"#bf360c" }}>{transplantReady.map(p=>p.name).join(", ")}</div></div>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
              <div style={{ fontWeight:900, fontSize:15, color:"#2e7d32" }}>My Plants ({plants.length})</div>
              <button onClick={()=>setShowAdd(true)} style={btn("linear-gradient(135deg,#ff7043,#ff8a65)")}>+ Add Plant</button>
            </div>

            {plants.map(plant => {
              const days = daysSince(plant.planted);
              const wr = getWateringRange(plant.waterEvery, myZone, plant.container);
              const ts = getTS(plant, days);
              const ur = UR[ts.urgency];
              const thirsty = daysSince(plant.lastWatered) >= plant.waterEvery;
              return (
                <div key={plant.id} onClick={()=>setSelectedPlant(plant)} style={{ ...card, cursor:"pointer", border: thirsty?"2px solid #ff7043":ts.urgency!=="growing"?`2px solid ${ur.border}`:"2px solid #e8f5e9", padding:0, overflow:"hidden" }}>
                  <div style={{ height:4, background:thirsty?"linear-gradient(90deg,#ff7043,#ffb74d)":`linear-gradient(90deg,#43a047,#66bb6a ${plant.health}%,#e0e0e0 ${plant.health}%)` }} />
                  <div style={{ padding:"11px 12px", display:"flex", gap:9, alignItems:"flex-start" }}>
                    <span style={{ fontSize:36 }}>{plant.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:900, fontSize:14, color:"#1b5e20" }}>{plant.name}</div>
                      <div style={{ fontSize:10, color:"#888" }}>📦 {plant.container} · 🗓 {days}d old</div>
                      <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                        <span style={badge(thirsty?"#fff3e0":"#e8f5e9", thirsty?"#ff7043":"#2e7d32")}>{thirsty?"💧 Needs water!":"✅ "+daysSince(plant.lastWatered)+"d ago"}</span>
                        <span style={badge("#e3f2fd","#1565c0")}>💧 {myZone?wLabel(wr)+" (Z"+myZone.zone+")":"every "+plant.waterEvery+"d"}</span>
                        <span style={{ ...badge(ur.bg,ur.color), border:`1px solid ${ur.border}` }}>{ur.label}</span>
                      </div>
                      <div style={{ fontSize:9, color:"#bbb", marginTop:3, fontStyle:"italic" }}>👆 Tap for full details</div>
                    </div>
                    <button onClick={ev=>{ev.stopPropagation();waterPlant(plant.id);}} style={{ ...btn(thirsty?"linear-gradient(135deg,#29b6f6,#4dd0e1)":"#e3f2fd", thirsty?"#fff":"#90a4ae"), padding:"7px 9px", fontSize:17, flexShrink:0 }}>💧</button>
                  </div>
                </div>
              );
            })}

            {plants.length===0 && <div style={{ textAlign:"center", padding:"36px 0", color:"#aaa" }}><div style={{ fontSize:44 }}>🪴</div><div style={{ fontWeight:800, marginTop:8 }}>No plants yet! Add your first above.</div></div>}

            {/* ADD PLANT SHEET */}
            {showAdd && (
              <div style={{ position:"fixed", inset:0, background:"#0008", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>{setShowAdd(false);setCustomMode(false);}}>
                <div style={{ background:"#fff", borderRadius:"22px 22px 0 0", padding:18, width:"100%", maxWidth:480, paddingBottom:34, maxHeight:"86vh", overflowY:"auto" }} onClick={ev=>ev.stopPropagation()}>
                  <div style={{ fontWeight:900, fontSize:16, color:"#2e7d32", marginBottom:11 }}>🌱 Add New Plant</div>
                  <div style={{ display:"flex", background:"#f5f5f5", borderRadius:9, padding:3, marginBottom:12, gap:3 }}>
                    {[["🌿 Common", false],["✏️ My Own", true]].map(([l,m]) => (
                      <button key={l} onClick={()=>setCustomMode(m)} style={{ flex:1, background:customMode===m?(m?"linear-gradient(135deg,#ff7043,#ff8a65)":"linear-gradient(135deg,#43a047,#66bb6a)"):"transparent", color:customMode===m?"#fff":"#666", border:"none", borderRadius:7, padding:"6px 4px", fontWeight:800, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
                    ))}
                  </div>
                  {!customMode && (
                    <>
                      <div style={{ fontSize:11, color:"#666", fontWeight:700, marginBottom:5 }}>Tap icon to auto-fill 👇</div>
                      <div style={{ display:"flex", gap:5, marginBottom:12, flexWrap:"wrap" }}>
                        {Object.entries(EMOJI_PRESETS).map(([em,pr]) => (
                          <button key={em} onClick={()=>setNewPlant(p=>({...p,emoji:em,name:pr.name||p.name,container:pr.container,waterEvery:pr.waterEvery}))} style={{ fontSize:24, background:newPlant.emoji===em?"#e8f5e9":"#f5f5f5", border:newPlant.emoji===em?"2px solid #43a047":"2px solid #e0e0e0", borderRadius:9, padding:"4px 6px", cursor:"pointer" }}>{em}</button>
                        ))}
                      </div>
                    </>
                  )}
                  {customMode && (
                    <div style={{ background:"#fff8f5", borderRadius:12, padding:11, marginBottom:12, border:"2px solid #ffe0b2" }}>
                      <div style={{ fontWeight:800, fontSize:11, color:"#e65100", marginBottom:6 }}>Type any plant name:</div>
                      <input value={newPlant.name} onChange={ev=>{setNewPlant(p=>({...p,name:ev.target.value}));}} placeholder="e.g. Lavender, Eggplant…" style={{ width:"100%", border:"2px solid #ffe0b2", borderRadius:7, padding:"8px 9px", fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                    </div>
                  )}
                  <div style={{ marginBottom:9 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>Plant name</div>
                    <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                      <span style={{ fontSize:24 }}>{newPlant.emoji}</span>
                      <input value={newPlant.name} onChange={ev=>setNewPlant(p=>({...p,name:ev.target.value}))} placeholder="e.g. Cherry Tomatoes" style={{ flex:1, border:"2px solid #e0e0e0", borderRadius:9, padding:"8px 9px", fontSize:12, fontFamily:"inherit", outline:"none" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom:9 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>Notes</div>
                    <input value={newPlant.notes} onChange={ev=>setNewPlant(p=>({...p,notes:ev.target.value}))} placeholder="Optional…" style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:9, padding:"8px 9px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }} />
                  </div>
                  <div style={{ marginBottom:9 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>Container</div>
                    <select value={newPlant.container} onChange={ev=>setNewPlant(p=>({...p,container:ev.target.value}))} style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:9, padding:"8px 9px", fontSize:12, fontFamily:"inherit", background:"#fff" }}>
                      {CONTAINER_TYPES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>
                      Water every <b style={{color:"#29b6f6"}}>{newPlant.waterEvery}d</b>
                      {myZone&&(()=>{ const r=getWateringRange(newPlant.waterEvery,myZone,newPlant.container); return <span style={{color:myZone.tc,marginLeft:5}}> → {myZone.emoji} {wLabel(r)}</span>; })()}
                    </div>
                    <input type="range" min={1} max={7} value={newPlant.waterEvery} onChange={ev=>setNewPlant(p=>({...p,waterEvery:+ev.target.value}))} style={{ width:"100%", accentColor:"#29b6f6" }} />
                    <div style={{ fontSize:9, color:"#2e7d32", background:"#e8f5e9", borderRadius:7, padding:"4px 7px", marginTop:5 }}>👆 Always finger-test soil 1" deep before watering.</div>
                  </div>
                  <button onClick={addPlant} style={{ ...btn("linear-gradient(135deg,#43a047,#66bb6a)"), width:"100%", padding:12, fontSize:14 }}>🌱 Add to My Garden</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GUIDES ── */}
        {tab==="guides" && !selectedGuide && !selectedWatering && (
          <div>
            <div style={{ display:"flex", background:"#fff", borderRadius:11, padding:3, marginBottom:10, gap:3 }}>
              {[["plants","🌿 Plants"],["watering","💧 Watering"]].map(([k,l]) => (
                <button key={k} onClick={()=>setGuidesTab(k)} style={{ flex:1, background:guidesTab===k?"linear-gradient(135deg,#29b6f6,#4dd0e1)":"transparent", color:guidesTab===k?"#fff":"#666", border:"none", borderRadius:9, padding:"7px 4px", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
              ))}
            </div>
            {guidesTab==="plants" && (
              <>
                {myZone&&<div style={{...card,background:`linear-gradient(135deg,${myZone.color},white)`,border:`1.5px solid ${myZone.tc}20`,fontSize:11,color:myZone.tc}}>{myZone.emoji} <b>Zone {myZone.zone}:</b> Best picks — <b>{myZone.plants.slice(0,3).join(", ")}</b></div>}
                <div style={{...card,background:"linear-gradient(135deg,#e3f2fd,#bbdefb)",fontSize:11}}><b>🥛 Milk Jug Tip:</b> Cut drainage holes in the bottom, then cut the top off or a side panel. Great for herbs, lettuce, and small peppers.</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10 }}>
                  {PLANT_GUIDES.map(g => {
                    const match = myZone&&myZone.plants.some(z=>z.toLowerCase().includes(g.name.toLowerCase().split(" ")[0])||g.name.toLowerCase().includes(z.toLowerCase()));
                    return (
                      <button key={g.name} onClick={()=>setSelectedGuide(g)} style={{ background:"#fff", border:match?`2.5px solid ${myZone.tc}`:"2px solid #e8f5e9", borderRadius:14, padding:"11px 7px", textAlign:"center", cursor:"pointer", fontFamily:"inherit", position:"relative", boxShadow:"0 2px 8px #0001" }}>
                        {match&&<div style={{ position:"absolute", top:4, right:4, ...badge(myZone.color,myZone.tc), fontSize:8 }}>{myZone.emoji}</div>}
                        <div style={{ fontSize:34 }}>{g.emoji}</div>
                        <div style={{ fontWeight:900, fontSize:12, color:"#1b5e20", marginTop:4 }}>{g.name}</div>
                        <div style={{ fontSize:9, color:"#888" }}>📦 {g.container}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {guidesTab==="watering" && WATERING_METHODS.map(m => (
              <button key={m.id} onClick={()=>setSelectedWatering(m)} style={{ ...card, width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:11, alignItems:"center" }}>
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

        {tab==="guides"&&selectedGuide&&(
          <div>
            <button onClick={()=>setSelectedGuide(null)} style={{...btn("#e8f5e9","#2e7d32"),marginBottom:10}}>← Back</button>
            <div style={card}>
              <div style={{ textAlign:"center", fontSize:52 }}>{selectedGuide.emoji}</div>
              <div style={{ textAlign:"center", fontWeight:900, fontSize:18, color:"#1b5e20", marginTop:5 }}>{selectedGuide.name}</div>
              {[["📦 Container",selectedGuide.container],["☀️ Sunlight",selectedGuide.sun]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1.5px solid #f5f5f5" }}>
                  <span style={{ fontWeight:700, color:"#555", fontSize:12 }}>{k}</span><span style={{ fontWeight:800, color:"#2e7d32", fontSize:12 }}>{v}</span>
                </div>
              ))}
              <div style={{ padding:"9px 0", borderBottom:"1.5px solid #f5f5f5" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontWeight:700, color:"#555", fontSize:12 }}>💧 Watering</span>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:800, color:"#2e7d32", fontSize:12 }}>{selectedGuide.water}</div>
                    {myZone&&(()=>{ const r=getWateringRange(selectedGuide.waterBase,myZone,selectedGuide.container); return <div style={{fontSize:10,color:myZone.tc,fontWeight:700}}>{myZone.emoji} Zone {myZone.zone}: {wLabel(r)}</div>; })()}
                  </div>
                </div>
                <div style={{ fontSize:9, color:"#aaa", marginTop:2 }}>👆 Always finger-test soil 1" before watering</div>
              </div>
              <div style={{ background:"linear-gradient(135deg,#fffde7,#fff9c4)", borderRadius:10, padding:10, marginTop:10 }}>
                <div style={{ fontWeight:800, color:"#f57f17", fontSize:11, marginBottom:2 }}>💡 Milk Jug Tip</div>
                <div style={{ fontSize:11, color:"#555", lineHeight:1.5 }}>{selectedGuide.tip}</div>
              </div>
            </div>
          </div>
        )}

        {tab==="guides"&&selectedWatering&&(
          <div>
            <button onClick={()=>setSelectedWatering(null)} style={{...btn("#e3f2fd","#1565c0"),marginBottom:10}}>← Back</button>
            <div style={card}>
              <div style={{ textAlign:"center", fontSize:44 }}>{selectedWatering.emoji}</div>
              <div style={{ textAlign:"center", fontWeight:900, fontSize:17, color:"#1b5e20", marginTop:5 }}>{selectedWatering.title}</div>
              <div style={{ textAlign:"center", marginTop:5 }}><span style={badge(selectedWatering.badgeColor,"#fff")}>{selectedWatering.badge}</span></div>
              <div style={{ background:"#f9fbe7", borderRadius:9, padding:9, marginTop:10, fontSize:11, color:"#444", lineHeight:1.5 }}>{selectedWatering.desc}</div>
              <div style={{ fontWeight:800, fontSize:12, color:"#2e7d32", marginTop:12, marginBottom:6 }}>📋 Steps</div>
              {selectedWatering.steps.map((s,i)=>(
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
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{selectedWatering.bestFor.map(c=><span key={c} style={badge("#e3f2fd","#1565c0")}>{c}</span>)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── ZONES ── */}
        {tab==="zones"&&!zoneDetail&&(
          <div>
            <div style={{ fontWeight:900, fontSize:15, color:"#2e7d32", marginBottom:4 }}>🗺️ Growing Zones</div>
            <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>Tap your zone for personalized tips!</div>
            <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#c8e6c9)", fontSize:10, color:"#2e7d32", marginBottom:10 }}>💡 Not sure? Search "USDA zone [your zip]"</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              {ZONES.map(z=>(
                <button key={z.zone} onClick={()=>setZoneDetail(z)} style={{ background:z.color, border:`2px solid ${z.tc}20`, borderRadius:12, padding:"9px 7px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7, boxShadow:"0 2px 7px #0001" }}>
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

        {tab==="zones"&&zoneDetail&&(
          <div>
            <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:10 }}>
              <button onClick={()=>setZoneDetail(null)} style={btn("#e8f5e9","#2e7d32")}>← All Zones</button>
              <button onClick={()=>{setMyZone(zoneDetail);setZoneDetail(null);}} style={{...btn("linear-gradient(135deg,#43a047,#66bb6a)"),fontSize:11}}>✅ Set as My Zone</button>
            </div>
            <div style={{ ...card, background:`linear-gradient(135deg,${zoneDetail.color},white)`, border:`2px solid ${zoneDetail.tc}20` }}>
              <div style={{ display:"flex", gap:11, alignItems:"center" }}>
                <span style={{ fontSize:40 }}>{zoneDetail.emoji}</span>
                <div><div style={{ fontWeight:900, fontSize:18, color:zoneDetail.tc }}>Zone {zoneDetail.zone}</div><div style={{ fontSize:11, color:"#666" }}>📍 {zoneDetail.region} · 🌡️ {zoneDetail.temp}</div></div>
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
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{zoneDetail.plants.map(p=><span key={p} style={badge(zoneDetail.color,zoneDetail.tc)}>{p}</span>)}</div>
            </div>
            <div style={card}>
              <div style={{ fontWeight:900, fontSize:12, color:"#2e7d32", marginBottom:7 }}>🥛 Container Tips</div>
              {zoneDetail.tips.map((t,i)=>(
                <div key={i} style={{ display:"flex", gap:7, background:"#f9fbe7", borderRadius:7, padding:"6px 8px", marginBottom:5 }}>
                  <span style={{ color:"#43a047", fontWeight:900, flexShrink:0 }}>✓</span><span style={{ fontSize:11, color:"#444" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CALCULATOR ── */}
        {tab==="calc"&&(
          <div>
            <div style={{ fontWeight:900, fontSize:15, color:"#2e7d32", marginBottom:2 }}>🧮 Planting Calculator</div>
            <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>Pick container + plant → see how many fit!</div>
            <div style={card}>
              <div style={{ fontWeight:900, color:"#1b5e20", fontSize:12, marginBottom:7 }}>1️⃣ Choose Container</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {CALC_CONTAINERS.map(c=>(
                  <button key={c.id} onClick={()=>setCalcCont(c)} style={{ background:calcCont?.id===c.id?"linear-gradient(135deg,#43a047,#66bb6a)":"#f5f5f5", color:calcCont?.id===c.id?"#fff":"#444", border:calcCont?.id===c.id?"2px solid #2e7d32":"2px solid #e0e0e0", borderRadius:9, padding:"5px 7px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", minWidth:54 }}>
                    <div style={{ fontSize:17 }}>{c.emoji}</div><div style={{ fontSize:8, fontWeight:800, lineHeight:1.2 }}>{c.label}</div>{c.volGal&&<div style={{ fontSize:8, opacity:0.7 }}>{c.volGal}gal</div>}
                  </button>
                ))}
              </div>
              {calcCont?.id==="custom"&&(
                <div style={{ marginTop:9, background:"#f9fbe7", borderRadius:9, padding:9 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                    {[["Diam (in)",cDiam,setCDiam],["Depth (in)",cDepth,setCDepth],["Vol (gal)",cVol,setCVol]].map(([l,v,s])=>(
                      <div key={l}><div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:2 }}>{l}</div><input type="number" value={v} onChange={ev=>s(ev.target.value)} placeholder="0" style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:6, padding:"5px 5px", fontSize:11, fontFamily:"inherit", boxSizing:"border-box" }} /></div>
                    ))}
                  </div>
                </div>
              )}
              {calcCont&&calcCont.id!=="custom"&&<div style={{ marginTop:7, fontSize:10, color:"#2e7d32", background:"#e8f5e9", borderRadius:7, padding:"4px 7px", display:"flex", gap:9 }}><span>📦 {calcCont.volGal}gal</span><span>⌀ {calcCont.diamIn}"</span><span>⬇️ {calcCont.depthIn}"</span></div>}
            </div>

            <div style={card}>
              <div style={{ fontWeight:900, color:"#1b5e20", fontSize:12, marginBottom:5 }}>2️⃣ Choose Plant</div>
              {myZone&&zonePlants.length>0&&(
                <>
                  <span style={{ ...badge(myZone.color,myZone.tc), marginBottom:7, display:"inline-block" }}>{myZone.emoji} Zone {myZone.zone} picks</span>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                    {zonePlants.map(p=>(
                      <button key={p.id} onClick={()=>{setCalcPlant(p);setCustPlantMode(false);}} style={{ background:calcPlant?.id===p.id&&!custPlantMode?"linear-gradient(135deg,#43a047,#66bb6a)":myZone.color, color:calcPlant?.id===p.id&&!custPlantMode?"#fff":myZone.tc, border:calcPlant?.id===p.id&&!custPlantMode?"2px solid #2e7d32":`2px solid ${myZone.tc}30`, borderRadius:9, padding:"5px 7px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", minWidth:52 }}>
                        <div style={{ fontSize:16 }}>{p.emoji}</div><div style={{ fontSize:8, fontWeight:800 }}>{p.label}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setShowAllCalc(v=>!v)} style={{ background:"transparent", border:"none", color:"#888", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:7 }}>{showAllCalc?"▲ Hide other plants":"▼ Show all other plants"}</button>
                </>
              )}
              {(!myZone||showAllCalc)&&(
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:7 }}>
                  {(myZone?otherCalcPlants:CALC_PLANTS).map(p=>(
                    <button key={p.id} onClick={()=>{setCalcPlant(p);setCustPlantMode(false);}} style={{ background:calcPlant?.id===p.id&&!custPlantMode?"linear-gradient(135deg,#43a047,#66bb6a)":"#f5f5f5", color:calcPlant?.id===p.id&&!custPlantMode?"#fff":"#444", border:calcPlant?.id===p.id&&!custPlantMode?"2px solid #2e7d32":"2px solid #e0e0e0", borderRadius:9, padding:"5px 7px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", minWidth:52 }}>
                      <div style={{ fontSize:16 }}>{p.emoji}</div><div style={{ fontSize:8, fontWeight:800 }}>{p.label}</div>
                    </button>
                  ))}
                </div>
              )}
              {!myZone&&<div style={{ fontSize:10, color:"#2e7d32", background:"#e8f5e9", borderRadius:7, padding:"4px 7px", marginBottom:7 }}>💡 Set your zone to see climate picks first! <button onClick={()=>setOnboarding(true)} style={{ background:"none", border:"none", color:"#43a047", fontWeight:800, cursor:"pointer", fontFamily:"inherit", fontSize:10 }}>Set zone →</button></div>}
              <div style={{ borderTop:"1.5px solid #f0f0f0", paddingTop:7 }}>
                <button onClick={()=>setCustPlantMode(v=>!v)} style={{ background:custPlantMode?"linear-gradient(135deg,#ff7043,#ff8a65)":"#f5f5f5", color:custPlantMode?"#fff":"#444", border:custPlantMode?"2px solid #e64a19":"2px dashed #ccc", borderRadius:9, padding:"4px 9px", cursor:"pointer", fontFamily:"inherit" }}>
                  ✏️ <span style={{ fontSize:9, fontWeight:800 }}>Custom Plant</span>
                </button>
              </div>
              {custPlantMode&&(
                <div style={{ marginTop:9, background:"#fff3e0", borderRadius:10, padding:10, border:"2px solid #ffe0b2" }}>
                  <div style={{ marginBottom:7 }}><div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:2 }}>Plant name</div><input value={cpName} onChange={ev=>setCpName(ev.target.value)} placeholder="e.g. Sunflower" style={{ width:"100%", border:"2px solid #ffe0b2", borderRadius:6, padding:"6px 7px", fontSize:11, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }} /></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                    {[["Spacing(in)",cpSpacing,setCpSpacing],["Root depth(in)",cpDepth,setCpDepth],["Min vol(gal)",cpMinVol,setCpMinVol]].map(([l,v,s])=>(
                      <div key={l}><div style={{ fontSize:9, fontWeight:700, color:"#888", marginBottom:2 }}>{l}</div><input type="number" value={v} onChange={ev=>s(ev.target.value)} placeholder="0" style={{ width:"100%", border:"2px solid #ffe0b2", borderRadius:6, padding:"5px 4px", fontSize:10, fontFamily:"inherit", boxSizing:"border-box" }} /></div>
                    ))}
                  </div>
                  <div style={{ fontSize:9, color:"#aaa", marginTop:5 }}>💡 Check seed packet for spacing & depth.</div>
                </div>
              )}
            </div>

            {calcResult&&(
              <div style={{ ...card, background:"linear-gradient(135deg,#e8f5e9,#f1f8e9)", border:"2px solid #a5d6a7" }}>
                <div style={{ fontWeight:900, fontSize:13, color:"#1b5e20", textAlign:"center", marginBottom:10 }}>{activePlant?.emoji} {activePlant?.label} in {calcCont?.label} {calcCont?.emoji}</div>

                {/* Container compatibility warning */}
                {activePlant && calcCont && COMPAT[activePlant.id] && COMPAT[activePlant.id][calcCont.label.replace(/^[12]-Gal /,"").replace("1-Gal ","").replace("2-Gal ","")] && (() => {
                  const contName = CONTAINER_TYPES.find(ct => calcCont.label.includes(ct.split(" ")[0])) || calcCont.label;
                  const compatKey = Object.keys(COMPAT[activePlant.id]).find(k => calcCont.label.includes(k.split(" ")[0]));
                  const level = compatKey ? COMPAT[activePlant.id][compatKey] : null;
                  const info = level ? COMPAT_INFO[level] : null;
                  if (!info) return null;
                  return <div style={{ background:info.bg, borderRadius:10, padding:"8px 10px", marginBottom:9, display:"flex", gap:7, alignItems:"center" }}>
                    <span style={{ fontSize:18 }}>{info.emoji}</span>
                    <div><div style={{ fontWeight:800, fontSize:11, color:info.color }}>{info.label}</div><div style={{ fontSize:10, color:"#666" }}>{activePlant.bestContainer && level !== "good" ? "Best container: "+activePlant.bestContainer : ""}</div></div>
                  </div>;
                })()}

                {calcResult.tooShallow||calcResult.tooSmall ? (
                  <div style={{ background:"#ffebee", borderRadius:10, padding:11, textAlign:"center" }}>
                    <div style={{ fontSize:26 }}>⚠️</div>
                    <div style={{ fontWeight:900, color:"#c62828", fontSize:12, marginTop:5 }}>Container Too Small!</div>
                    {calcResult.tooShallow&&<div style={{ fontSize:11, color:"#666", marginTop:3 }}>Needs at least <b>{activePlant.rootDepthIn}"</b> depth — this is only <b>{calcResult.depth}"</b></div>}
                    {calcResult.tooSmall&&<div style={{ fontSize:11, color:"#666", marginTop:3 }}>Needs at least <b>{activePlant.minVolGal}gal</b> — this holds <b>{calcResult.vol}gal</b></div>}
                    {activePlant.bestContainer&&<div style={{ fontSize:11, color:"#2e7d32", marginTop:5, fontWeight:700 }}>✅ Try a {activePlant.bestContainer} instead!</div>}
                  </div>
                ):(
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:9 }}>
                      {[["🌱","Plants Fit",calcResult.count,calcResult.count===1?"plant":"plants","#e8f5e9","#2e7d32"],["🪨","Soil",calcResult.soilQts,"qts","#fff3e0","#e65100"],["📦","Also",calcResult.soilCuFt,"cu ft","#e3f2fd","#1565c0"]].map(([em,lbl,val,unit,bg,col])=>(
                        <div key={lbl} style={{ background:bg, borderRadius:10, padding:"9px 5px", textAlign:"center" }}>
                          <div style={{ fontSize:18 }}>{em}</div><div style={{ fontWeight:900, fontSize:18, color:col }}>{val}</div><div style={{ fontSize:9, color:col, fontWeight:700 }}>{unit}</div><div style={{ fontSize:8, color:"#888" }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                    {/* Soil bag recommendation */}
                    {SOIL_DATA[calcCont.id] && <div style={{ background:"#fff3e0", borderRadius:9, padding:"7px 9px", marginBottom:7, fontSize:10, color:"#e65100" }}>🛍️ <b>Buy:</b> {SOIL_DATA[calcCont.id].bagSize}</div>}
                    <div style={{ background:"#fff", borderRadius:9, padding:9, marginBottom:7, fontSize:10, color:"#444" }}><b>📐</b> {activePlant.spacingIn}" spacing · {activePlant.rootDepthIn}" root depth · {calcResult.vol}gal container</div>
                    <div style={{ background:"linear-gradient(135deg,#fffde7,#fff9c4)", borderRadius:9, padding:"7px 9px", fontSize:10, color:"#555" }}>💡 {activePlant.notes}</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MILK JUG MODE ── */}
        {tab==="jug" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#e3f2fd,#bbdefb)", borderRadius:16, padding:14, marginBottom:12 }}>
              <div style={{ fontWeight:900, fontSize:16, color:"#1565c0", marginBottom:3 }}>🥛 Milk Jug Mode</div>
              <div style={{ fontSize:11, color:"#1565c0", lineHeight:1.5 }}>Everything you need to know about growing in 1-gallon milk jugs — what works, what doesn't, and exactly how to care for each plant.</div>
            </div>

            {/* Soil info card */}
            <div style={{ ...card, background:"linear-gradient(135deg,#fff3e0,#ffe0b2)", border:"1.5px solid #ff9800" }}>
              <div style={{ fontWeight:900, fontSize:13, color:"#e65100", marginBottom:7 }}>🪨 Soil for a 1-Gal Milk Jug</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[["🛍️ How Much","~3.4 quarts"],["💰 Buy","Small 8qt bag"],["🔄 Refill","Every 1-2 seasons"],["🌱 Type","Potting mix (not garden soil)"]].map(([l,v])=>(
                  <div key={l} style={{ background:"rgba(255,255,255,0.7)", borderRadius:9, padding:"7px 8px" }}>
                    <div style={{ fontSize:10, color:"#e65100", fontWeight:800 }}>{l}</div>
                    <div style={{ fontSize:11, color:"#444", marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:10, color:"#888", marginTop:8 }}>💡 Fill to 1" below the rim so water doesn't splash out. Mix in some perlite for better drainage!</div>
            </div>

            {/* Watering for jugs */}
            <div style={{ ...card }}>
              <div style={{ fontWeight:900, fontSize:13, color:"#2e7d32", marginBottom:7 }}>💧 Watering Your Milk Jugs</div>
              {[["⭐ Bottom Watering (Best!)","Set jug in a tray with 1–2\" water. Let soak 20–30 min. Roots drink from below — no overwatering!"],["🚿 Top Watering","Pour slowly at base until water drains from bottom holes. Water in morning."],["💡 Self-Watering Jug","Cut jug in half, use bottom as reservoir with a fabric wick. Set and almost forget!"]].map(([t,d])=>(
                <div key={t} style={{ background:"#f5f5f5", borderRadius:9, padding:"8px 10px", marginBottom:6 }}>
                  <div style={{ fontWeight:800, fontSize:11, color:"#1b5e20" }}>{t}</div>
                  <div style={{ fontSize:10, color:"#555", marginTop:2 }}>{d}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display:"flex", background:"#fff", borderRadius:10, padding:3, marginBottom:10, gap:3 }}>
              {[["all","🌱 All Plants"],["good","✅ Works Great"],["bad","🚫 Avoid"]].map(([k,l])=>(
                <button key={k} onClick={()=>setJugPlantFilter(k)} style={{ flex:1, background:jugPlantFilter===k?"linear-gradient(135deg,#43a047,#66bb6a)":"transparent", color:jugPlantFilter===k?"#fff":"#666", border:"none", borderRadius:8, padding:"7px 3px", fontWeight:800, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
              ))}
            </div>

            {/* Plant list */}
            {JUG_PLANTS.filter(p => jugPlantFilter==="all" ? true : jugPlantFilter==="good" ? p.compatible!==false : p.compatible===false).map(jp => (
              <div key={jp.id} style={{ ...card, border: jp.compatible===false?"2px solid #ffcdd2":jp.compatible==="ok"?"2px solid #ffe0b2":"2px solid #c8e6c9", padding:0, overflow:"hidden" }}>
                <div style={{ height:3, background:jp.compatible===false?"#ef9a9a":jp.compatible==="ok"?"#ffcc80":"#a5d6a7" }} />
                <div style={{ padding:"11px 12px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <span style={{ fontSize:32 }}>{jp.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:900, fontSize:14, color:"#1b5e20" }}>{jp.label}</span>
                        <span style={{ ...badge(jp.compatible===false?"#ffebee":jp.compatible==="ok"?"#fff3e0":"#e8f5e9", jp.compatible===false?"#c62828":jp.compatible==="ok"?"#e65100":"#2e7d32"), fontSize:9 }}>
                          {jp.compatible===false?"🚫 Not for jugs":jp.compatible==="ok"?"⚠️ Use 2-gal jug":"✅ Great in jugs"}
                        </span>
                      </div>
                      {jp.compatible!==false && (
                        <div style={{ display:"flex", gap:5, marginTop:5, flexWrap:"wrap" }}>
                          <span style={badge("#e3f2fd","#1565c0")}>💧 every {jp.waterEvery}d</span>
                          <span style={badge("#f3e5f5","#7b1fa2")}>📏 {jp.spacingIn}" apart</span>
                          {jp.soilQts && <span style={badge("#fff3e0","#e65100")}>🪨 {jp.soilQts}qt soil</span>}
                        </div>
                      )}
                      <div style={{ fontSize:10, color:"#666", marginTop:6, lineHeight:1.4 }}>{jp.tip}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── PLANT DETAIL OVERLAY ── */}
      {selectedPlant&&(()=>{
        const p = plants.find(pl=>pl.id===selectedPlant.id)||selectedPlant;
        const days = daysSince(p.planted);
        const wr = getWateringRange(p.waterEvery, myZone, p.container);
        const ts = getTS(p, days);
        const ur = UR[ts.urgency];
        const thirsty = daysSince(p.lastWatered) >= p.waterEvery;
        return (
          <div style={{ position:"fixed", inset:0, zIndex:200, background:"linear-gradient(160deg,#e8f5e9,#fffde7)", maxWidth:480, margin:"0 auto", overflowY:"auto" }}>
            <div style={{ background:"linear-gradient(90deg,#43a047,#66bb6a)", padding:"14px 14px 16px", borderRadius:"0 0 22px 22px", boxShadow:"0 4px 18px #43a04740" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <button onClick={()=>setSelectedPlant(null)} style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:7, padding:"4px 9px", color:"#fff", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
                <span style={{ fontSize:38 }}>{p.emoji}</span>
                <div style={{ flex:1 }}><div style={{ color:"#fff", fontWeight:900, fontSize:17 }}>{p.name}</div><div style={{ color:"#c8e6c9", fontSize:10 }}>📦 {p.container} · 🗓 {days} days old</div></div>
                <button onClick={()=>setEditingPlant({...p})} style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:7, padding:"4px 9px", color:"#fff", fontWeight:800, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>✏️ Edit</button>
              </div>
              <div style={{ marginTop:11 }}>
                <div style={{ display:"flex", justifyContent:"space-between", color:"#c8e6c9", fontSize:9, marginBottom:3 }}><span>Health</span><span>❤️ {p.health}%</span></div>
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
                  <div style={{ fontSize:9, color:"#888" }}>{myZone?myZone.emoji+" "+wLabel(wr):"Every "+p.waterEvery+"d"}</div>
                  <button onClick={()=>waterPlant(p.id)} style={{...btn("linear-gradient(135deg,#29b6f6,#4dd0e1)"),marginTop:7,padding:"4px 9px",fontSize:10}}>💧 Water now</button>
                </div>
                <div style={card}>
                  <div style={{ fontSize:20 }}>🗓</div>
                  <div style={{ fontWeight:900, fontSize:11, color:"#2e7d32", marginTop:4 }}>Day {days}</div>
                  <div style={{ fontSize:9, color:"#888" }}>Since planting</div>
                  {myZone&&<div style={{ fontSize:9, color:myZone.tc, fontWeight:700, marginTop:2 }}>{myZone.emoji} Zone {myZone.zone}</div>}
                  <div style={{ fontSize:9, color:"#aaa" }}>{p.container}</div>
                </div>
              </div>
              <div style={{ ...card, background:"#e8f5e9", fontSize:10, color:"#2e7d32", marginBottom:9 }}>
                👆 <b>Finger test:</b> poke 1" into soil — water only if dry.{p.container==="Fabric Bag"?" Fabric bags dry fast — check daily!":p.container==="Coffee Can"?" Metal cans heat up — check often in summer.":""}
              </div>
              {p.notes&&<div style={{ ...card, background:"#fffde7", border:"1.5px solid #fff9c4", marginBottom:9 }}><div style={{ fontWeight:800, fontSize:10, color:"#f57f17", marginBottom:2 }}>📝 Notes</div><div style={{ fontSize:11, color:"#555", fontStyle:"italic" }}>"{p.notes}"</div></div>}
              <div style={{ ...card, background:ur.bg, border:`2px solid ${ur.border}`, marginBottom:9 }}>
                <div style={{ fontWeight:900, fontSize:12, color:ur.color, marginBottom:9 }}>🪴 Transplant Status — {ur.label}</div>
                <div style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, fontWeight:700, color:"#666", marginBottom:3 }}><span>Time in container</span><span>{days}d / {ts.daysMin}–{ts.daysMax}d window</span></div>
                  <div style={{ background:"rgba(0,0,0,0.08)", borderRadius:7, height:8, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:Math.min(100,(days/ts.daysMax)*100)+"%", background:ts.urgency==="urgent"?"#ff6f00":ts.urgency==="ready"?"#f9a825":ts.urgency==="watch"?"#aed581":"#66bb6a", borderRadius:7 }} />
                  </div>
                </div>
                <div style={{ fontWeight:800, fontSize:10, color:"#555", marginBottom:5 }}>Check any signs you notice:</div>
                {VISUAL_SIGNS.map(sign=>{
                  const checked=(p.transplantSigns||[]).includes(sign.id);
                  return (
                    <button key={sign.id} onClick={()=>toggleSign(p.id,sign.id)} style={{ display:"flex", alignItems:"center", gap:7, background:checked?"#fff3e0":"rgba(255,255,255,0.8)", border:checked?"2px solid #ff9800":"2px solid #e0e0e0", borderRadius:8, padding:"6px 9px", cursor:"pointer", fontFamily:"inherit", textAlign:"left", width:"100%", marginBottom:4 }}>
                      <span style={{ fontSize:15, flexShrink:0 }}>{checked?"✅":"⬜"}</span>
                      <span style={{ fontSize:10, fontWeight:checked?800:600, color:checked?"#e65100":"#555" }}>{sign.icon} {sign.label}</span>
                    </button>
                  );
                })}
                {ts.signs>0&&<div style={{ background:"rgba(255,255,255,0.85)", borderRadius:7, padding:"6px 9px", marginTop:7, marginBottom:9, fontSize:10, color:"#555" }}>{ts.signs>=3?"🚨 3+ signs — definitely root-bound. Move it up!":ts.signs===2?"⚠️ 2 signs — getting crowded. Plan transplant soon.":"👀 1 sign — keep watching this week."}</div>}
                <div style={{ background:"rgba(255,255,255,0.85)", borderRadius:9, padding:"8px 10px", marginBottom:9 }}>
                  <div style={{ fontWeight:900, fontSize:10, color:"#2e7d32", marginBottom:2 }}>➡️ Recommended next container</div>
                  <div style={{ fontWeight:800, fontSize:13, color:"#1b5e20" }}>{ts.next} <span style={{ fontSize:10, color:"#888", fontWeight:600 }}>({ts.nextVol})</span></div>
                  <div style={{ fontSize:9, color:"#666", marginTop:2 }}>💡 Transplant 1–2 days after watering. Loosen roots gently.</div>
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <button onClick={()=>markTransplanted(p.id)} style={{...btn("linear-gradient(135deg,#43a047,#66bb6a)"),flex:1,padding:"9px 7px",fontSize:10}}>✅ Mark as Transplanted</button>
                  <button onClick={()=>deletePlant(p.id)} style={{...btn("#ffebee","#c62828"),padding:"9px 10px",fontSize:10,border:"1.5px solid #ffcdd2"}}>🗑 Delete</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EDIT PLANT OVERLAY ── */}
      {editingPlant && (
        <div style={{ position:"fixed", inset:0, background:"#0008", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setEditingPlant(null)}>
          <div style={{ background:"#fff", borderRadius:"22px 22px 0 0", padding:20, width:"100%", maxWidth:480, paddingBottom:36, maxHeight:"80vh", overflowY:"auto" }} onClick={ev=>ev.stopPropagation()}>
            <div style={{ fontWeight:900, fontSize:16, color:"#2e7d32", marginBottom:14 }}>✏️ Edit {editingPlant.name}</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>Plant name</div>
              <input value={editingPlant.name} onChange={ev=>setEditingPlant(p=>({...p,name:ev.target.value}))} style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:9, padding:"8px 9px", fontSize:13, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }} />
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>Container</div>
              <select value={editingPlant.container} onChange={ev=>setEditingPlant(p=>({...p,container:ev.target.value}))} style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:9, padding:"8px 9px", fontSize:13, fontFamily:"inherit", background:"#fff" }}>
                {CONTAINER_TYPES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>Notes</div>
              <input value={editingPlant.notes||""} onChange={ev=>setEditingPlant(p=>({...p,notes:ev.target.value}))} placeholder="Optional notes…" style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:9, padding:"8px 9px", fontSize:13, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }} />
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:3 }}>
                Water every <b style={{color:"#29b6f6"}}>{editingPlant.waterEvery}d</b>
                {myZone&&(()=>{ const r=getWateringRange(editingPlant.waterEvery,myZone,editingPlant.container); return <span style={{color:myZone.tc,marginLeft:5}}> → {myZone.emoji} {wLabel(r)}</span>; })()}
              </div>
              <input type="range" min={1} max={7} value={editingPlant.waterEvery} onChange={ev=>setEditingPlant(p=>({...p,waterEvery:+ev.target.value}))} style={{ width:"100%", accentColor:"#29b6f6" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#aaa" }}><span>Daily</span><span>Weekly</span></div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setEditingPlant(null)} style={{...btn("#f5f5f5","#666"),flex:1}}>Cancel</button>
              <button onClick={saveEdit} style={{...btn("linear-gradient(135deg,#43a047,#66bb6a)"),flex:2}}>✅ Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');`}</style>
    </div>
  );
}
