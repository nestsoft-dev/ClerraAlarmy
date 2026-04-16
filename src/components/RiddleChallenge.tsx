<<<<<<< HEAD
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Vibration, Animated, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, SafeAreaView, ScrollView,
} from 'react-native';
import { ChallengeDifficulty } from '../types';
import { useTheme } from '../context/ThemeContext';

// ─── Riddle Bank ─────────────────────────────────────────────────────────────
const RIDDLES = {
  easy: [
    { q: "What has to be broken before you can use it?", a: ["egg","an egg","the egg"], hint: "3 letters" },
    { q: "What has hands but can’t clap?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What gets wetter the more it dries?", a: ["towel","a towel","the towel"], hint: "5 letters" },
    { q: "What has a neck but no head?", a: ["bottle","a bottle","the bottle"], hint: "6 letters" },
    { q: "What can travel around the world while staying in one corner?", a: ["stamp","a stamp","the stamp"], hint: "5 letters" },
    { q: "What has one eye but can’t see?", a: ["needle","a needle","the needle"], hint: "6 letters" },
    { q: "What is full of holes but still holds water?", a: ["sponge","a sponge","the sponge"], hint: "6 letters" },
    { q: "What has legs but doesn’t walk?", a: ["table","a table","the table"], hint: "5 letters" },
    { q: "What runs but never walks?", a: ["water","a water","the water"], hint: "5 letters" },
    { q: "What has teeth but can’t bite?", a: ["comb","a comb","the comb"], hint: "4 letters" },
    { q: "What goes up but never comes down?", a: ["age","an age","the age"], hint: "3 letters" },
    { q: "What has keys but can’t open locks?", a: ["piano","a piano","the piano"], hint: "5 letters" },
    { q: "What can you catch but not throw?", a: ["cold","a cold","the cold"], hint: "4 letters" },
    { q: "What is always in front of you but can’t be seen?", a: ["future","a future","the future"], hint: "6 letters" },
    { q: "What gets bigger the more you take away?", a: ["hole","a hole","the hole"], hint: "4 letters" },
    { q: "What has a tail but no body?", a: ["coin","a coin","the coin"], hint: "4 letters" },
    { q: "What is black when clean and white when dirty?", a: ["chalkboard","a chalkboard","the chalkboard"], hint: "10 letters" },
    { q: "What has ears but cannot hear?", a: ["corn","a corn","the corn"], hint: "4 letters" },
    { q: "What has a thumb and four fingers but is not alive?", a: ["glove","a glove","the glove"], hint: "5 letters" },
    { q: "What goes up and down but doesn’t move?", a: ["stairs","a stairs","the stairs"], hint: "6 letters" },
    { q: "What is light as a feather but can’t be held long?", a: ["breath","a breath","the breath"], hint: "6 letters" },
    { q: "What has a ring but no finger?", a: ["phone","a phone","the phone"], hint: "5 letters" },
    { q: "What begins with T, ends with T, and has T in it?", a: ["teapot","a teapot","the teapot"], hint: "6 letters" },
    { q: "What has a bed but never sleeps?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What can fill a room but takes up no space?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What gets sharper the more you use it?", a: ["brain","a brain","the brain"], hint: "5 letters" },
    { q: "What has many teeth but can’t bite?", a: ["zipper","a zipper","the zipper"], hint: "6 letters" },
    { q: "What comes down but never goes up?", a: ["rain","a rain","the rain"], hint: "4 letters" },
    { q: "What has one head, one foot, and four legs?", a: ["bed","a bed","the bed"], hint: "3 letters" },
    { q: "What kind of band never plays music?", a: ["rubber band","a rubber band","the rubber band"], hint: "6 and 4 letters" },
    { q: "What has words but never speaks?", a: ["book","a book","the book"], hint: "4 letters" },
    { q: "What is always running but never moves?", a: ["refrigerator","a refrigerator","the refrigerator"], hint: "12 letters" },
    { q: "What can you hold without touching it?", a: ["breath","a breath","the breath"], hint: "6 letters" },
    { q: "What has an eye but cannot see (storm)?", a: ["storm","a storm","the storm"], hint: "5 letters" },
    { q: "What can you break without touching it?", a: ["promise","a promise","the promise"], hint: "7 letters" },
    { q: "What has branches but no leaves?", a: ["bank","a bank","the bank"], hint: "4 letters" },
    { q: "What goes through cities and fields but never moves?", a: ["road","a road","the road"], hint: "4 letters" },
    { q: "What gets shorter as it burns?", a: ["candle","a candle","the candle"], hint: "6 letters" },
    { q: "What can you hear but not see?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What has a heart that doesn’t beat?", a: ["artichoke","an artichoke","the artichoke"], hint: "9 letters" },
    { q: "What kind of coat is always wet?", a: ["paint","a paint","the paint"], hint: "5 letters" },
    { q: "What has a horn but doesn’t honk?", a: ["rhinoceros","a rhinoceros","the rhinoceros"], hint: "10 letters" },
    { q: "What is always coming but never arrives?", a: ["tomorrow","a tomorrow","the tomorrow"], hint: "8 letters" },
    { q: "What has a tongue but cannot taste?", a: ["shoe","a shoe","the shoe"], hint: "4 letters" },
    { q: "What has four wheels and flies?", a: ["garbage truck","a garbage truck","the garbage truck"], hint: "7 and 5 letters" },
    { q: "What goes up when rain comes down?", a: ["umbrella","an umbrella","the umbrella"], hint: "8 letters" },
    { q: "What can’t talk but will reply?", a: ["echo","an echo","the echo"], hint: "4 letters" },
    { q: "What is easy to lift but hard to throw?", a: ["feather","a feather","the feather"], hint: "7 letters" },
    { q: "What has no life but can die?", a: ["battery","a battery","the battery"], hint: "7 letters" },
    { q: "What has stripes but no color?", a: ["barcode","a barcode","the barcode"], hint: "7 letters" },
    { q: "What has a face but no eyes, nose, or mouth?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What kind of cup can’t hold water?", a: ["cupcake","a cupcake","the cupcake"], hint: "7 letters" },
    { q: "What has four legs but can’t walk?", a: ["chair","a chair","the chair"], hint: "5 letters" },
    { q: "What has a head but never weeps?", a: ["nail","a nail","the nail"], hint: "4 letters" },
    { q: "What kind of room can you eat?", a: ["mushroom","a mushroom","the mushroom"], hint: "8 letters" },
    { q: "What has a tail and a head but no body?", a: ["coin","a coin","the coin"], hint: "4 letters" },
    { q: "What is always hungry but never eats?", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "What has a spine but no bones?", a: ["book","a book","the book"], hint: "4 letters" },
    { q: "What gets bigger the more you add to it?", a: ["pile","a pile","the pile"], hint: "4 letters" },
    { q: "What has wheels and carries people but isn’t alive?", a: ["bus","a bus","the bus"], hint: "3 letters" },
    { q: "What has a cover but no pages?", a: ["bed","a bed","the bed"], hint: "3 letters" },
    { q: "What has a bark but no bite?", a: ["tree","a tree","the tree"], hint: "4 letters" },
    { q: "What has keys but no locks (computer)?", a: ["keyboard","a keyboard","the keyboard"], hint: "8 letters" },
    { q: "What flies but has no wings?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has a lid but no jar?", a: ["eye","an eye","the eye"], hint: "3 letters" },
    { q: "What is white when dirty?", a: ["chalkboard","a chalkboard","the chalkboard"], hint: "10 letters" },
    { q: "What goes up but never comes down (again)?", a: ["age","an age","the age"], hint: "3 letters" },
    { q: "What can you open but cannot close?", a: ["egg","an egg","the egg"], hint: "3 letters" },
    { q: "What is always moving but stays in place?", a: ["clock hands","a clock hands","the clock hands"], hint: "5 and 5 letters" },
    { q: "What has a mouth but cannot eat?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What has ears but cannot listen?", a: ["corn","a corn","the corn"], hint: "4 letters" },
    { q: "What can you hear but not touch?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What has a base but no top?", a: ["baseball field","a baseball field","the baseball field"], hint: "8 and 5 letters" },
    { q: "What has pages but isn’t a book?", a: ["notebook","a notebook","the notebook"], hint: "8 letters" },
    { q: "What is soft but hard to break?", a: ["pillow","a pillow","the pillow"], hint: "6 letters" },
    { q: "What has a bell but doesn’t ring?", a: ["pepper","a pepper","the pepper"], hint: "6 letters" },
    { q: "What can you carry but not see?", a: ["weight","a weight","the weight"], hint: "6 letters" },
    { q: "What is always behind you?", a: ["past","a past","the past"], hint: "4 letters" },
    { q: "What has no tail but moves fast?", a: ["wind","a wind","the wind"], hint: "4 letters" },
    { q: "What has a screen but no brain?", a: ["tv","a tv","the tv"], hint: "2 letters" },
    { q: "What can you wear but not touch?", a: ["smile","a smile","the smile"], hint: "5 letters" },
    { q: "What has a hole in the middle and holds things?", a: ["ring","a ring","the ring"], hint: "4 letters" },
    { q: "What gets hotter the colder it gets?", a: ["soup","a soup","the soup"], hint: "4 letters" },
    { q: "What has a face but never smiles?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What has a lock but no key?", a: ["hair","a hair","the hair"], hint: "4 letters" },
    { q: "What has a tongue but cannot talk?", a: ["shoe","a shoe","the shoe"], hint: "4 letters" },
    { q: "What is always above you?", a: ["sky","a sky","the sky"], hint: "3 letters" },
    { q: "What can you sit on but not see?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has a top but no bottom?", a: ["hat","a hat","the hat"], hint: "3 letters" },
    { q: "What has no hands but can point?", a: ["compass","a compass","the compass"], hint: "7 letters" },
    { q: "What has numbers but can’t count?", a: ["phone","a phone","the phone"], hint: "5 letters" },
    { q: "What has a line but no hook?", a: ["pencil","a pencil","the pencil"], hint: "6 letters" },
    { q: "What gets full but never eats?", a: ["moon","a moon","the moon"], hint: "4 letters" },
    { q: "What has no teeth but can bite?", a: ["cold","a cold","the cold"], hint: "4 letters" },
    { q: "What has a shell but no animal?", a: ["egg","an egg","the egg"], hint: "3 letters" },
    { q: "What is always empty but can be filled?", a: ["cup","a cup","the cup"], hint: "3 letters" },
    { q: "What has a stick but no leaf?", a: ["lollipop","a lollipop","the lollipop"], hint: "8 letters" },
    { q: "What can shine but isn’t a star?", a: ["light bulb","a light bulb","the light bulb"], hint: "5 and 4 letters" },
    { q: "What has a door but no house?", a: ["car","a car","the car"], hint: "3 letters" },
    { q: "What moves but has no legs?", a: ["snake","a snake","the snake"], hint: "5 letters" },
  ],
  medium: [
    { q: "I speak without a mouth and hear without ears.", a: ["echo","an echo","the echo"], hint: "4 letters" },
    { q: "The more you take, the more you leave behind.", a: ["footsteps","a footsteps","the footsteps"], hint: "9 letters" },
    { q: "I shave every day, but my beard stays the same.", a: ["barber","a barber","the barber"], hint: "6 letters" },
    { q: "I have cities but no houses.", a: ["map","a map","the map"], hint: "3 letters" },
    { q: "I have keys but no locks, space but no room.", a: ["keyboard","a keyboard","the keyboard"], hint: "8 letters" },
    { q: "What disappears as soon as you say its name?", a: ["silence","a silence","the silence"], hint: "7 letters" },
    { q: "What begins with E but only contains one letter?", a: ["envelope","an envelope","the envelope"], hint: "8 letters" },
    { q: "What has 13 hearts but no organs?", a: ["deck of cards","a deck of cards","the deck of cards"], hint: "4 and 2 and 5 letters" },
    { q: "What kind of tree can you carry in your hand?", a: ["palm","a palm","the palm"], hint: "4 letters" },
    { q: "What has a head, a tail, but no body?", a: ["coin","a coin","the coin"], hint: "4 letters" },
    { q: "What gets broken without being held?", a: ["promise","a promise","the promise"], hint: "7 letters" },
    { q: "What runs but never walks, has a mouth but never talks?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What comes once in a minute, twice in a moment, never in a thousand years?", a: ["letter m","a letter m","the letter m"], hint: "6 and 1 letters" },
    { q: "What has a bottom at the top?", a: ["legs","a legs","the legs"], hint: "4 letters" },
    { q: "What kind of room has no doors or windows?", a: ["mushroom","a mushroom","the mushroom"], hint: "8 letters" },
    { q: "What is always hungry and must be fed?", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "What has a neck but no head, two arms but no hands?", a: ["shirt","a shirt","the shirt"], hint: "5 letters" },
    { q: "What has roots but never grows?", a: ["mountain","a mountain","the mountain"], hint: "8 letters" },
    { q: "What has an eye but can see (device)?", a: ["camera","a camera","the camera"], hint: "6 letters" },
    { q: "What has no beginning, end, or middle?", a: ["circle","a circle","the circle"], hint: "6 letters" },
    { q: "What has no legs but travels fast?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What can you keep after giving it away?", a: ["your word","a your word","the your word"], hint: "4 and 4 letters" },
    { q: "What is so fragile saying its name breaks it?", a: ["silence","a silence","the silence"], hint: "7 letters" },
    { q: "What has a face but no eyes, mouth, or nose?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What can run but never gets tired?", a: ["engine","an engine","the engine"], hint: "6 letters" },
    { q: "What has no wings but can fly (time-based)?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no mouth but whispers?", a: ["wind","a wind","the wind"], hint: "4 letters" },
    { q: "What gets bigger the more you feed it?", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "What has no shadow?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no weight but bends trees?", a: ["wind","a wind","the wind"], hint: "4 letters" },
    { q: "What has one letter but many words?", a: ["dictionary","a dictionary","the dictionary"], hint: "10 letters" },
    { q: "What has no door but you can enter?", a: ["opportunity","an opportunity","the opportunity"], hint: "11 letters" },
    { q: "What has no key but opens hearts?", a: ["love","a love","the love"], hint: "4 letters" },
    { q: "What gets colder the more you heat it?", a: ["iron","an iron","the iron"], hint: "4 letters" },
    { q: "What has no feet but can climb?", a: ["smoke","a smoke","the smoke"], hint: "5 letters" },
    { q: "What is always old but always new?", a: ["history","a history","the history"], hint: "7 letters" },
    { q: "What has no name but exists?", a: ["unknown","an unknown","the unknown"], hint: "7 letters" },
    { q: "What has no body but moves mountains?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no end but always begins?", a: ["day","a day","the day"], hint: "3 letters" },
    { q: "What can be cracked, made, told, and played?", a: ["joke","a joke","the joke"], hint: "4 letters" },
    { q: "What can be stolen but never touched?", a: ["identity","an identity","the identity"], hint: "8 letters" },
    { q: "What has no light but guides you?", a: ["instinct","an instinct","the instinct"], hint: "8 letters" },
    { q: "What has no limit but fades?", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "What has no path but leads somewhere?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no shape but is always there?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What can grow but isn’t alive?", a: ["shadow","a shadow","the shadow"], hint: "6 letters" },
    { q: "What has no color but can brighten?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no sound but communicates?", a: ["signal","a signal","the signal"], hint: "6 letters" },
    { q: "What exists only when shared?", a: ["secret","a secret","the secret"], hint: "6 letters" },
    { q: "What grows when you give it away?", a: ["happiness","a happiness","the happiness"], hint: "9 letters" },
    { q: "What can run but never tires, has a bed but never sleeps?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What has one head, one foot, and four legs?", a: ["bed","a bed","the bed"], hint: "3 letters" },
    { q: "What can be measured but has no length?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no eyes but can see (tech)?", a: ["camera","a camera","the camera"], hint: "6 letters" },
    { q: "What has no ears but can hear (tech)?", a: ["microphone","a microphone","the microphone"], hint: "10 letters" },
    { q: "What has no mouth but can answer?", a: ["phone","a phone","the phone"], hint: "5 letters" },
    { q: "What has no legs but can walk (object)?", a: ["shoes","a shoes","the shoes"], hint: "5 letters" },
    { q: "What has no wings but can travel far?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What gets stronger the more it’s used?", a: ["brain","a brain","the brain"], hint: "5 letters" },
    { q: "What has no end but is always finishing?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What can be written but never spoken?", a: ["code","a code","the code"], hint: "4 letters" },
    { q: "What has a beginning but no end?", a: ["infinity","an infinity","the infinity"], hint: "8 letters" },
    { q: "What gets lighter the more you add?", a: ["helium balloon","a helium balloon","the helium balloon"], hint: "6 and 7 letters" },
    { q: "What has no face but shows emotion?", a: ["voice","a voice","the voice"], hint: "5 letters" },
    { q: "What can be shared but never divided?", a: ["secret","a secret","the secret"], hint: "6 letters" },
    { q: "What grows without water?", a: ["crystal","a crystal","the crystal"], hint: "7 letters" },
    { q: "What has no color but can be seen?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no form but creates form?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no power but controls?", a: ["fear","a fear","the fear"], hint: "4 letters" },
    { q: "What has no sound but spreads fast?", a: ["rumor","a rumor","the rumor"], hint: "5 letters" },
    { q: "What has no body but lives in minds?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What can be lost but never found again?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no hands but builds?", a: ["machine","a machine","the machine"], hint: "7 letters" },
    { q: "What has no legs but climbs walls?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no shape but fills a container?", a: ["liquid","a liquid","the liquid"], hint: "6 letters" },
    { q: "What can be opened but never closed (forever)?", a: ["mind","a mind","the mind"], hint: "4 letters" },
    { q: "What has no limit but ends?", a: ["life","a life","the life"], hint: "4 letters" },
    { q: "What can be copied but never original again?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no smell but affects everything?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no weight but slows you down?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no sound but can be loud?", a: ["silence","a silence","the silence"], hint: "7 letters" },
    { q: "What has no color but paints everything?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no direction but leads you?", a: ["instinct","an instinct","the instinct"], hint: "8 letters" },
    { q: "What has no structure but builds worlds?", a: ["imagination","an imagination","the imagination"], hint: "11 letters" },
    { q: "What has no value but is priceless?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no body but ages?", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "What has no form but defines form?", a: ["space","a space","the space"], hint: "5 letters" },
    { q: "What has no edge but can cut?", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "What has no brain but learns?", a: ["ai","an ai","the ai"], hint: "2 letters" },
    { q: "What has no heart but breaks?", a: ["trust","a trust","the trust"], hint: "5 letters" },
    { q: "What has no start but always begins?", a: ["day","a day","the day"], hint: "3 letters" },
    { q: "What has no rules but controls outcomes?", a: ["chance","a chance","the chance"], hint: "6 letters" },
    { q: "What has no sound but carries meaning?", a: ["text","a text","the text"], hint: "4 letters" },
    { q: "What has no life but evolves?", a: ["technology","a technology","the technology"], hint: "10 letters" },
    { q: "What has no hands but can guide?", a: ["map","a map","the map"], hint: "3 letters" },
    { q: "What has no eyes but reveals truth?", a: ["mirror","a mirror","the mirror"], hint: "6 letters" },
    { q: "What has no body but spreads?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no shadow but exists?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no origin but continues?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no end but can stop suddenly?", a: ["life","a life","the life"], hint: "4 letters" },
  ],
  hard: [
    { q: "I am not alive, but I grow; I don’t have lungs, but I need air.", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "The person who makes it doesn’t need it; the one who buys it doesn’t use it.", a: ["coffin","a coffin","the coffin"], hint: "6 letters" },
    { q: "What can fill a room but takes no space?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What is always coming but never arrives?", a: ["tomorrow","a tomorrow","the tomorrow"], hint: "8 letters" },
    { q: "What has no body but casts a shadow?", a: ["cloud","a cloud","the cloud"], hint: "5 letters" },
    { q: "What can you hold in your right hand but not your left?", a: ["left hand","a left hand","the left hand"], hint: "4 and 4 letters" },
    { q: "What has many faces but no head?", a: ["dice","a dice","the dice"], hint: "4 letters" },
    { q: "What is always moving but never leaves its place?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no legs but travels endlessly?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has a heart but no blood?", a: ["artichoke","an artichoke","the artichoke"], hint: "9 letters" },
    { q: "What has no voice but can still speak?", a: ["book","a book","the book"], hint: "4 letters" },
    { q: "What can you break without touching?", a: ["promise","a promise","the promise"], hint: "7 letters" },
    { q: "What has no wings but can cross oceans?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What exists but cannot be seen?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no form but fills everything?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no size but grows forever?", a: ["knowledge","a knowledge","the knowledge"], hint: "9 letters" },
    { q: "What has no sound but can be heard?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no start but has an end?", a: ["line","a line","the line"], hint: "4 letters" },
    { q: "What has no end but continues forever?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What can’t be touched but can be felt deeply?", a: ["emotion","an emotion","the emotion"], hint: "7 letters" },
    { q: "What has no shape but takes any form?", a: ["water","a water","the water"], hint: "5 letters" },
    { q: "What reflects everything but shows nothing?", a: ["mirror","a mirror","the mirror"], hint: "6 letters" },
    { q: "What breaks but never falls?", a: ["day","a day","the day"], hint: "3 letters" },
    { q: "What falls but never breaks?", a: ["night","a night","the night"], hint: "5 letters" },
    { q: "What is always yours but others use it more?", a: ["name","a name","the name"], hint: "4 letters" },
    { q: "What gets bigger when more is taken away?", a: ["hole","a hole","the hole"], hint: "4 letters" },
    { q: "What runs but has no legs, cries but has no eyes?", a: ["cloud","a cloud","the cloud"], hint: "5 letters" },
    { q: "What has no life but can die instantly?", a: ["battery","a battery","the battery"], hint: "7 letters" },
    { q: "What flies without wings and cries without eyes?", a: ["cloud","a cloud","the cloud"], hint: "5 letters" },
    { q: "What has no brain but makes decisions?", a: ["algorithm","an algorithm","the algorithm"], hint: "9 letters" },
    { q: "What has no body but controls bodies?", a: ["mind","a mind","the mind"], hint: "4 letters" },
    { q: "What has no beginning but has always existed?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What is invisible but makes things visible?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no edge but can cut deeply?", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "What has no weight but can crush you?", a: ["pressure","a pressure","the pressure"], hint: "8 letters" },
    { q: "What has no length but measures everything?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no language but is understood worldwide?", a: ["emotion","an emotion","the emotion"], hint: "7 letters" },
    { q: "What has no face but shows expressions?", a: ["emoji","an emoji","the emoji"], hint: "5 letters" },
    { q: "What has no reality but shapes decisions?", a: ["fear","a fear","the fear"], hint: "4 letters" },
    { q: "What has no color but defines all colors?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no origin but defines existence?", a: ["universe","an universe","the universe"], hint: "8 letters" },
    { q: "What has no direction but leads everywhere?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no sound but can start wars?", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "What has no limit but ends lives?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no substance but builds worlds?", a: ["imagination","an imagination","the imagination"], hint: "11 letters" },
    { q: "What has no memory but stores everything?", a: ["data","a data","the data"], hint: "4 letters" },
    { q: "What has no movement but changes everything?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no presence but is always felt?", a: ["gravity","a gravity","the gravity"], hint: "7 letters" },
    { q: "What has no shape but controls space?", a: ["gravity","a gravity","the gravity"], hint: "7 letters" },
    { q: "What has no end but defines endings?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I exist only when you look for me, but disappear when you find me.", a: ["mystery","a mystery","the mystery"], hint: "7 letters" },
    { q: "I am created by you but can destroy you.", a: ["fear","a fear","the fear"], hint: "4 letters" },
    { q: "I grow stronger when shared, weaker when hidden.", a: ["truth","a truth","the truth"], hint: "5 letters" },
    { q: "I am always there, yet you never see me directly.", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "I can travel faster than light, yet never move.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I shape reality but have no physical form.", a: ["belief","a belief","the belief"], hint: "6 letters" },
    { q: "I can be broken without being touched.", a: ["trust","a trust","the trust"], hint: "5 letters" },
    { q: "I live in the past but affect the future.", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "I am free but priceless.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I can exist forever or vanish instantly.", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "I have no weight but can crush souls.", a: ["guilt","a guilt","the guilt"], hint: "5 letters" },
    { q: "I have no voice but can silence crowds.", a: ["presence","a presence","the presence"], hint: "8 letters" },
    { q: "I have no body but can fill a room.", a: ["tension","a tension","the tension"], hint: "7 letters" },
    { q: "I have no face but can scare you.", a: ["darkness","a darkness","the darkness"], hint: "8 letters" },
    { q: "I am invisible but leave marks everywhere.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I can’t be seen but can be measured.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I have no color but define all colors.", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "I can build or destroy worlds.", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "I have no limit but always end.", a: ["life","a life","the life"], hint: "4 letters" },
    { q: "I exist between moments.", a: ["now","a now","the now"], hint: "3 letters" },
    { q: "I am always moving but never change.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I am always changing but never move.", a: ["shadow","a shadow","the shadow"], hint: "6 letters" },
    { q: "I can’t be touched but can hurt deeply.", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "I can exist in silence but speak loudly.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I can’t be owned but can be wasted.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I am always there but rarely noticed.", a: ["breath","a breath","the breath"], hint: "6 letters" },
    { q: "I have no body but control bodies.", a: ["mind","a mind","the mind"], hint: "4 letters" },
    { q: "I can be given but never taken back.", a: ["word","a word","the word"], hint: "4 letters" },
    { q: "I exist only when you believe.", a: ["faith","a faith","the faith"], hint: "5 letters" },
    { q: "I disappear when exposed.", a: ["secret","a secret","the secret"], hint: "6 letters" },
    { q: "I grow when fed but die when given drink.", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "I have no beginning but everything starts from me.", a: ["zero","a zero","the zero"], hint: "4 letters" },
    { q: "I can multiply without growing.", a: ["numbers","a numbers","the numbers"], hint: "7 letters" },
    { q: "I have no voice but command armies.", a: ["orders","an orders","the orders"], hint: "6 letters" },
    { q: "I can exist in nothingness.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I shape decisions without logic.", a: ["emotion","an emotion","the emotion"], hint: "7 letters" },
    { q: "I have no speed but outrun everything.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I am constant but always changing.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I define existence but cannot be touched.", a: ["reality","a reality","the reality"], hint: "7 letters" },
    { q: "I am infinite yet limited.", a: ["universe","an universe","the universe"], hint: "8 letters" },
    { q: "I can be created instantly but last forever.", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "I can’t be seen but reveals everything.", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "I am always ahead but never reachable.", a: ["future","a future","the future"], hint: "6 letters" },
    { q: "I am always behind but never gone.", a: ["past","a past","the past"], hint: "4 letters" },
    { q: "I can exist without space.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I can destroy without force.", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "I can exist without time.", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "I am everywhere but nowhere.", a: ["space","a space","the space"], hint: "5 letters" },
    { q: "I am nothing but everything depends on me.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I end everything but never begin.", a: ["death","a death","the death"], hint: "5 letters" },
  ],
};

interface Props {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

export const RiddleChallenge: React.FC<Props> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const pool = difficulty === 1 ? RIDDLES.easy : difficulty === 2 ? RIDDLES.medium : RIDDLES.hard;
  const [riddle] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const diffLabel = difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard';

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;
    const cleaned = answer.trim().toLowerCase();
    const isCorrect = riddle.a.some(acc => acc.toLowerCase() === cleaned);

    if (isCorrect) {
      setFeedback('correct');
      Vibration.vibrate([0, 100, 50, 100]);
      setTimeout(() => onComplete(), 800);
    } else {
      setFeedback('wrong');
      shake();
      Vibration.vibrate([0, 400]);
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        onFail();
      }, 1000);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              {/* The riddle itself — big, direct, no chrome */}
              <Text style={styles.questionText}>{riddle.q}</Text>

              {/* Hint — easy only */}
              {difficulty === 1 && (
                <TouchableOpacity
                  style={styles.hintBtn}
                  onPress={() => setShowHint(!showHint)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hintBtnText}>
                    {showHint ? 'Hide hint' : 'Show hint'}
                  </Text>
                </TouchableOpacity>
              )}
              {showHint && (
                <Text style={styles.hintText}>{riddle.hint}</Text>
              )}
            </ScrollView>

            {/* Answer section — always at bottom above keyboard */}
            <View style={styles.answerSection}>
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <TextInput
                  style={[
                    styles.input,
                    feedback === 'correct' && styles.inputCorrect,
                    feedback === 'wrong' && styles.inputWrong,
                  ]}
                  placeholder="Type your answer…"
                  placeholderTextColor={isDark ? colors.subtext : 'rgba(46,30,26,0.3)'}
                  value={answer}
                  onChangeText={setAnswer}
                  autoCorrect={false}
                  autoCapitalize="none"
                  onSubmitEditing={checkAnswer}
                  returnKeyType="done"
                  autoFocus
                  selectionColor="#FF7F62"
                />
              </Animated.View>

              <TouchableOpacity
                style={[styles.primaryBtn, !answer.trim() && styles.primaryBtnDisabled]}
                onPress={checkAnswer}
                disabled={!answer.trim() || feedback !== null}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryBtnText, !answer.trim() && styles.primaryBtnTextDisabled]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF7F62',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 28,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 28,
    textAlign: 'center',
  },
  hintBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  hintBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7F62',
    letterSpacing: 0.3,
  },
  hintText: {
    fontSize: 15,
    color: colors.subtext,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  answerSection: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    gap: 12,
  },
  input: {
    height: 56,
    backgroundColor: isDark ? colors.surface : '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.1)',
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  inputCorrect: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52,199,89,0.04)',
  },
  inputWrong: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.04)',
  },
  primaryBtn: {
    backgroundColor: '#FF7F62',
    borderRadius: 30,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.04)',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryBtnTextDisabled: {
    color: colors.subtext,
  },
});
=======
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Vibration, Animated, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, SafeAreaView, ScrollView,
} from 'react-native';
import { ChallengeDifficulty } from '../types';
import { useTheme } from '../context/ThemeContext';

// ─── Riddle Bank ─────────────────────────────────────────────────────────────
const RIDDLES = {
  easy: [
    { q: "What has to be broken before you can use it?", a: ["egg","an egg","the egg"], hint: "3 letters" },
    { q: "What has hands but can’t clap?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What gets wetter the more it dries?", a: ["towel","a towel","the towel"], hint: "5 letters" },
    { q: "What has a neck but no head?", a: ["bottle","a bottle","the bottle"], hint: "6 letters" },
    { q: "What can travel around the world while staying in one corner?", a: ["stamp","a stamp","the stamp"], hint: "5 letters" },
    { q: "What has one eye but can’t see?", a: ["needle","a needle","the needle"], hint: "6 letters" },
    { q: "What is full of holes but still holds water?", a: ["sponge","a sponge","the sponge"], hint: "6 letters" },
    { q: "What has legs but doesn’t walk?", a: ["table","a table","the table"], hint: "5 letters" },
    { q: "What runs but never walks?", a: ["water","a water","the water"], hint: "5 letters" },
    { q: "What has teeth but can’t bite?", a: ["comb","a comb","the comb"], hint: "4 letters" },
    { q: "What goes up but never comes down?", a: ["age","an age","the age"], hint: "3 letters" },
    { q: "What has keys but can’t open locks?", a: ["piano","a piano","the piano"], hint: "5 letters" },
    { q: "What can you catch but not throw?", a: ["cold","a cold","the cold"], hint: "4 letters" },
    { q: "What is always in front of you but can’t be seen?", a: ["future","a future","the future"], hint: "6 letters" },
    { q: "What gets bigger the more you take away?", a: ["hole","a hole","the hole"], hint: "4 letters" },
    { q: "What has a tail but no body?", a: ["coin","a coin","the coin"], hint: "4 letters" },
    { q: "What is black when clean and white when dirty?", a: ["chalkboard","a chalkboard","the chalkboard"], hint: "10 letters" },
    { q: "What has ears but cannot hear?", a: ["corn","a corn","the corn"], hint: "4 letters" },
    { q: "What has a thumb and four fingers but is not alive?", a: ["glove","a glove","the glove"], hint: "5 letters" },
    { q: "What goes up and down but doesn’t move?", a: ["stairs","a stairs","the stairs"], hint: "6 letters" },
    { q: "What is light as a feather but can’t be held long?", a: ["breath","a breath","the breath"], hint: "6 letters" },
    { q: "What has a ring but no finger?", a: ["phone","a phone","the phone"], hint: "5 letters" },
    { q: "What begins with T, ends with T, and has T in it?", a: ["teapot","a teapot","the teapot"], hint: "6 letters" },
    { q: "What has a bed but never sleeps?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What can fill a room but takes up no space?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What gets sharper the more you use it?", a: ["brain","a brain","the brain"], hint: "5 letters" },
    { q: "What has many teeth but can’t bite?", a: ["zipper","a zipper","the zipper"], hint: "6 letters" },
    { q: "What comes down but never goes up?", a: ["rain","a rain","the rain"], hint: "4 letters" },
    { q: "What has one head, one foot, and four legs?", a: ["bed","a bed","the bed"], hint: "3 letters" },
    { q: "What kind of band never plays music?", a: ["rubber band","a rubber band","the rubber band"], hint: "6 and 4 letters" },
    { q: "What has words but never speaks?", a: ["book","a book","the book"], hint: "4 letters" },
    { q: "What is always running but never moves?", a: ["refrigerator","a refrigerator","the refrigerator"], hint: "12 letters" },
    { q: "What can you hold without touching it?", a: ["breath","a breath","the breath"], hint: "6 letters" },
    { q: "What has an eye but cannot see (storm)?", a: ["storm","a storm","the storm"], hint: "5 letters" },
    { q: "What can you break without touching it?", a: ["promise","a promise","the promise"], hint: "7 letters" },
    { q: "What has branches but no leaves?", a: ["bank","a bank","the bank"], hint: "4 letters" },
    { q: "What goes through cities and fields but never moves?", a: ["road","a road","the road"], hint: "4 letters" },
    { q: "What gets shorter as it burns?", a: ["candle","a candle","the candle"], hint: "6 letters" },
    { q: "What can you hear but not see?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What has a heart that doesn’t beat?", a: ["artichoke","an artichoke","the artichoke"], hint: "9 letters" },
    { q: "What kind of coat is always wet?", a: ["paint","a paint","the paint"], hint: "5 letters" },
    { q: "What has a horn but doesn’t honk?", a: ["rhinoceros","a rhinoceros","the rhinoceros"], hint: "10 letters" },
    { q: "What is always coming but never arrives?", a: ["tomorrow","a tomorrow","the tomorrow"], hint: "8 letters" },
    { q: "What has a tongue but cannot taste?", a: ["shoe","a shoe","the shoe"], hint: "4 letters" },
    { q: "What has four wheels and flies?", a: ["garbage truck","a garbage truck","the garbage truck"], hint: "7 and 5 letters" },
    { q: "What goes up when rain comes down?", a: ["umbrella","an umbrella","the umbrella"], hint: "8 letters" },
    { q: "What can’t talk but will reply?", a: ["echo","an echo","the echo"], hint: "4 letters" },
    { q: "What is easy to lift but hard to throw?", a: ["feather","a feather","the feather"], hint: "7 letters" },
    { q: "What has no life but can die?", a: ["battery","a battery","the battery"], hint: "7 letters" },
    { q: "What has stripes but no color?", a: ["barcode","a barcode","the barcode"], hint: "7 letters" },
    { q: "What has a face but no eyes, nose, or mouth?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What kind of cup can’t hold water?", a: ["cupcake","a cupcake","the cupcake"], hint: "7 letters" },
    { q: "What has four legs but can’t walk?", a: ["chair","a chair","the chair"], hint: "5 letters" },
    { q: "What has a head but never weeps?", a: ["nail","a nail","the nail"], hint: "4 letters" },
    { q: "What kind of room can you eat?", a: ["mushroom","a mushroom","the mushroom"], hint: "8 letters" },
    { q: "What has a tail and a head but no body?", a: ["coin","a coin","the coin"], hint: "4 letters" },
    { q: "What is always hungry but never eats?", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "What has a spine but no bones?", a: ["book","a book","the book"], hint: "4 letters" },
    { q: "What gets bigger the more you add to it?", a: ["pile","a pile","the pile"], hint: "4 letters" },
    { q: "What has wheels and carries people but isn’t alive?", a: ["bus","a bus","the bus"], hint: "3 letters" },
    { q: "What has a cover but no pages?", a: ["bed","a bed","the bed"], hint: "3 letters" },
    { q: "What has a bark but no bite?", a: ["tree","a tree","the tree"], hint: "4 letters" },
    { q: "What has keys but no locks (computer)?", a: ["keyboard","a keyboard","the keyboard"], hint: "8 letters" },
    { q: "What flies but has no wings?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has a lid but no jar?", a: ["eye","an eye","the eye"], hint: "3 letters" },
    { q: "What is white when dirty?", a: ["chalkboard","a chalkboard","the chalkboard"], hint: "10 letters" },
    { q: "What goes up but never comes down (again)?", a: ["age","an age","the age"], hint: "3 letters" },
    { q: "What can you open but cannot close?", a: ["egg","an egg","the egg"], hint: "3 letters" },
    { q: "What is always moving but stays in place?", a: ["clock hands","a clock hands","the clock hands"], hint: "5 and 5 letters" },
    { q: "What has a mouth but cannot eat?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What has ears but cannot listen?", a: ["corn","a corn","the corn"], hint: "4 letters" },
    { q: "What can you hear but not touch?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What has a base but no top?", a: ["baseball field","a baseball field","the baseball field"], hint: "8 and 5 letters" },
    { q: "What has pages but isn’t a book?", a: ["notebook","a notebook","the notebook"], hint: "8 letters" },
    { q: "What is soft but hard to break?", a: ["pillow","a pillow","the pillow"], hint: "6 letters" },
    { q: "What has a bell but doesn’t ring?", a: ["pepper","a pepper","the pepper"], hint: "6 letters" },
    { q: "What can you carry but not see?", a: ["weight","a weight","the weight"], hint: "6 letters" },
    { q: "What is always behind you?", a: ["past","a past","the past"], hint: "4 letters" },
    { q: "What has no tail but moves fast?", a: ["wind","a wind","the wind"], hint: "4 letters" },
    { q: "What has a screen but no brain?", a: ["tv","a tv","the tv"], hint: "2 letters" },
    { q: "What can you wear but not touch?", a: ["smile","a smile","the smile"], hint: "5 letters" },
    { q: "What has a hole in the middle and holds things?", a: ["ring","a ring","the ring"], hint: "4 letters" },
    { q: "What gets hotter the colder it gets?", a: ["soup","a soup","the soup"], hint: "4 letters" },
    { q: "What has a face but never smiles?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What has a lock but no key?", a: ["hair","a hair","the hair"], hint: "4 letters" },
    { q: "What has a tongue but cannot talk?", a: ["shoe","a shoe","the shoe"], hint: "4 letters" },
    { q: "What is always above you?", a: ["sky","a sky","the sky"], hint: "3 letters" },
    { q: "What can you sit on but not see?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has a top but no bottom?", a: ["hat","a hat","the hat"], hint: "3 letters" },
    { q: "What has no hands but can point?", a: ["compass","a compass","the compass"], hint: "7 letters" },
    { q: "What has numbers but can’t count?", a: ["phone","a phone","the phone"], hint: "5 letters" },
    { q: "What has a line but no hook?", a: ["pencil","a pencil","the pencil"], hint: "6 letters" },
    { q: "What gets full but never eats?", a: ["moon","a moon","the moon"], hint: "4 letters" },
    { q: "What has no teeth but can bite?", a: ["cold","a cold","the cold"], hint: "4 letters" },
    { q: "What has a shell but no animal?", a: ["egg","an egg","the egg"], hint: "3 letters" },
    { q: "What is always empty but can be filled?", a: ["cup","a cup","the cup"], hint: "3 letters" },
    { q: "What has a stick but no leaf?", a: ["lollipop","a lollipop","the lollipop"], hint: "8 letters" },
    { q: "What can shine but isn’t a star?", a: ["light bulb","a light bulb","the light bulb"], hint: "5 and 4 letters" },
    { q: "What has a door but no house?", a: ["car","a car","the car"], hint: "3 letters" },
    { q: "What moves but has no legs?", a: ["snake","a snake","the snake"], hint: "5 letters" },
  ],
  medium: [
    { q: "I speak without a mouth and hear without ears.", a: ["echo","an echo","the echo"], hint: "4 letters" },
    { q: "The more you take, the more you leave behind.", a: ["footsteps","a footsteps","the footsteps"], hint: "9 letters" },
    { q: "I shave every day, but my beard stays the same.", a: ["barber","a barber","the barber"], hint: "6 letters" },
    { q: "I have cities but no houses.", a: ["map","a map","the map"], hint: "3 letters" },
    { q: "I have keys but no locks, space but no room.", a: ["keyboard","a keyboard","the keyboard"], hint: "8 letters" },
    { q: "What disappears as soon as you say its name?", a: ["silence","a silence","the silence"], hint: "7 letters" },
    { q: "What begins with E but only contains one letter?", a: ["envelope","an envelope","the envelope"], hint: "8 letters" },
    { q: "What has 13 hearts but no organs?", a: ["deck of cards","a deck of cards","the deck of cards"], hint: "4 and 2 and 5 letters" },
    { q: "What kind of tree can you carry in your hand?", a: ["palm","a palm","the palm"], hint: "4 letters" },
    { q: "What has a head, a tail, but no body?", a: ["coin","a coin","the coin"], hint: "4 letters" },
    { q: "What gets broken without being held?", a: ["promise","a promise","the promise"], hint: "7 letters" },
    { q: "What runs but never walks, has a mouth but never talks?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What comes once in a minute, twice in a moment, never in a thousand years?", a: ["letter m","a letter m","the letter m"], hint: "6 and 1 letters" },
    { q: "What has a bottom at the top?", a: ["legs","a legs","the legs"], hint: "4 letters" },
    { q: "What kind of room has no doors or windows?", a: ["mushroom","a mushroom","the mushroom"], hint: "8 letters" },
    { q: "What is always hungry and must be fed?", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "What has a neck but no head, two arms but no hands?", a: ["shirt","a shirt","the shirt"], hint: "5 letters" },
    { q: "What has roots but never grows?", a: ["mountain","a mountain","the mountain"], hint: "8 letters" },
    { q: "What has an eye but can see (device)?", a: ["camera","a camera","the camera"], hint: "6 letters" },
    { q: "What has no beginning, end, or middle?", a: ["circle","a circle","the circle"], hint: "6 letters" },
    { q: "What has no legs but travels fast?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What can you keep after giving it away?", a: ["your word","a your word","the your word"], hint: "4 and 4 letters" },
    { q: "What is so fragile saying its name breaks it?", a: ["silence","a silence","the silence"], hint: "7 letters" },
    { q: "What has a face but no eyes, mouth, or nose?", a: ["clock","a clock","the clock"], hint: "5 letters" },
    { q: "What can run but never gets tired?", a: ["engine","an engine","the engine"], hint: "6 letters" },
    { q: "What has no wings but can fly (time-based)?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no mouth but whispers?", a: ["wind","a wind","the wind"], hint: "4 letters" },
    { q: "What gets bigger the more you feed it?", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "What has no shadow?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no weight but bends trees?", a: ["wind","a wind","the wind"], hint: "4 letters" },
    { q: "What has one letter but many words?", a: ["dictionary","a dictionary","the dictionary"], hint: "10 letters" },
    { q: "What has no door but you can enter?", a: ["opportunity","an opportunity","the opportunity"], hint: "11 letters" },
    { q: "What has no key but opens hearts?", a: ["love","a love","the love"], hint: "4 letters" },
    { q: "What gets colder the more you heat it?", a: ["iron","an iron","the iron"], hint: "4 letters" },
    { q: "What has no feet but can climb?", a: ["smoke","a smoke","the smoke"], hint: "5 letters" },
    { q: "What is always old but always new?", a: ["history","a history","the history"], hint: "7 letters" },
    { q: "What has no name but exists?", a: ["unknown","an unknown","the unknown"], hint: "7 letters" },
    { q: "What has no body but moves mountains?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no end but always begins?", a: ["day","a day","the day"], hint: "3 letters" },
    { q: "What can be cracked, made, told, and played?", a: ["joke","a joke","the joke"], hint: "4 letters" },
    { q: "What can be stolen but never touched?", a: ["identity","an identity","the identity"], hint: "8 letters" },
    { q: "What has no light but guides you?", a: ["instinct","an instinct","the instinct"], hint: "8 letters" },
    { q: "What has no limit but fades?", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "What has no path but leads somewhere?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no shape but is always there?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What can grow but isn’t alive?", a: ["shadow","a shadow","the shadow"], hint: "6 letters" },
    { q: "What has no color but can brighten?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no sound but communicates?", a: ["signal","a signal","the signal"], hint: "6 letters" },
    { q: "What exists only when shared?", a: ["secret","a secret","the secret"], hint: "6 letters" },
    { q: "What grows when you give it away?", a: ["happiness","a happiness","the happiness"], hint: "9 letters" },
    { q: "What can run but never tires, has a bed but never sleeps?", a: ["river","a river","the river"], hint: "5 letters" },
    { q: "What has one head, one foot, and four legs?", a: ["bed","a bed","the bed"], hint: "3 letters" },
    { q: "What can be measured but has no length?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no eyes but can see (tech)?", a: ["camera","a camera","the camera"], hint: "6 letters" },
    { q: "What has no ears but can hear (tech)?", a: ["microphone","a microphone","the microphone"], hint: "10 letters" },
    { q: "What has no mouth but can answer?", a: ["phone","a phone","the phone"], hint: "5 letters" },
    { q: "What has no legs but can walk (object)?", a: ["shoes","a shoes","the shoes"], hint: "5 letters" },
    { q: "What has no wings but can travel far?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What gets stronger the more it’s used?", a: ["brain","a brain","the brain"], hint: "5 letters" },
    { q: "What has no end but is always finishing?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What can be written but never spoken?", a: ["code","a code","the code"], hint: "4 letters" },
    { q: "What has a beginning but no end?", a: ["infinity","an infinity","the infinity"], hint: "8 letters" },
    { q: "What gets lighter the more you add?", a: ["helium balloon","a helium balloon","the helium balloon"], hint: "6 and 7 letters" },
    { q: "What has no face but shows emotion?", a: ["voice","a voice","the voice"], hint: "5 letters" },
    { q: "What can be shared but never divided?", a: ["secret","a secret","the secret"], hint: "6 letters" },
    { q: "What grows without water?", a: ["crystal","a crystal","the crystal"], hint: "7 letters" },
    { q: "What has no color but can be seen?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no form but creates form?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no power but controls?", a: ["fear","a fear","the fear"], hint: "4 letters" },
    { q: "What has no sound but spreads fast?", a: ["rumor","a rumor","the rumor"], hint: "5 letters" },
    { q: "What has no body but lives in minds?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What can be lost but never found again?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no hands but builds?", a: ["machine","a machine","the machine"], hint: "7 letters" },
    { q: "What has no legs but climbs walls?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no shape but fills a container?", a: ["liquid","a liquid","the liquid"], hint: "6 letters" },
    { q: "What can be opened but never closed (forever)?", a: ["mind","a mind","the mind"], hint: "4 letters" },
    { q: "What has no limit but ends?", a: ["life","a life","the life"], hint: "4 letters" },
    { q: "What can be copied but never original again?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no smell but affects everything?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no weight but slows you down?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no sound but can be loud?", a: ["silence","a silence","the silence"], hint: "7 letters" },
    { q: "What has no color but paints everything?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no direction but leads you?", a: ["instinct","an instinct","the instinct"], hint: "8 letters" },
    { q: "What has no structure but builds worlds?", a: ["imagination","an imagination","the imagination"], hint: "11 letters" },
    { q: "What has no value but is priceless?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no body but ages?", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "What has no form but defines form?", a: ["space","a space","the space"], hint: "5 letters" },
    { q: "What has no edge but can cut?", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "What has no brain but learns?", a: ["ai","an ai","the ai"], hint: "2 letters" },
    { q: "What has no heart but breaks?", a: ["trust","a trust","the trust"], hint: "5 letters" },
    { q: "What has no start but always begins?", a: ["day","a day","the day"], hint: "3 letters" },
    { q: "What has no rules but controls outcomes?", a: ["chance","a chance","the chance"], hint: "6 letters" },
    { q: "What has no sound but carries meaning?", a: ["text","a text","the text"], hint: "4 letters" },
    { q: "What has no life but evolves?", a: ["technology","a technology","the technology"], hint: "10 letters" },
    { q: "What has no hands but can guide?", a: ["map","a map","the map"], hint: "3 letters" },
    { q: "What has no eyes but reveals truth?", a: ["mirror","a mirror","the mirror"], hint: "6 letters" },
    { q: "What has no body but spreads?", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "What has no shadow but exists?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no origin but continues?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no end but can stop suddenly?", a: ["life","a life","the life"], hint: "4 letters" },
  ],
  hard: [
    { q: "I am not alive, but I grow; I don’t have lungs, but I need air.", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "The person who makes it doesn’t need it; the one who buys it doesn’t use it.", a: ["coffin","a coffin","the coffin"], hint: "6 letters" },
    { q: "What can fill a room but takes no space?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What is always coming but never arrives?", a: ["tomorrow","a tomorrow","the tomorrow"], hint: "8 letters" },
    { q: "What has no body but casts a shadow?", a: ["cloud","a cloud","the cloud"], hint: "5 letters" },
    { q: "What can you hold in your right hand but not your left?", a: ["left hand","a left hand","the left hand"], hint: "4 and 4 letters" },
    { q: "What has many faces but no head?", a: ["dice","a dice","the dice"], hint: "4 letters" },
    { q: "What is always moving but never leaves its place?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no legs but travels endlessly?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has a heart but no blood?", a: ["artichoke","an artichoke","the artichoke"], hint: "9 letters" },
    { q: "What has no voice but can still speak?", a: ["book","a book","the book"], hint: "4 letters" },
    { q: "What can you break without touching?", a: ["promise","a promise","the promise"], hint: "7 letters" },
    { q: "What has no wings but can cross oceans?", a: ["sound","a sound","the sound"], hint: "5 letters" },
    { q: "What exists but cannot be seen?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no form but fills everything?", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "What has no size but grows forever?", a: ["knowledge","a knowledge","the knowledge"], hint: "9 letters" },
    { q: "What has no sound but can be heard?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no start but has an end?", a: ["line","a line","the line"], hint: "4 letters" },
    { q: "What has no end but continues forever?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What can’t be touched but can be felt deeply?", a: ["emotion","an emotion","the emotion"], hint: "7 letters" },
    { q: "What has no shape but takes any form?", a: ["water","a water","the water"], hint: "5 letters" },
    { q: "What reflects everything but shows nothing?", a: ["mirror","a mirror","the mirror"], hint: "6 letters" },
    { q: "What breaks but never falls?", a: ["day","a day","the day"], hint: "3 letters" },
    { q: "What falls but never breaks?", a: ["night","a night","the night"], hint: "5 letters" },
    { q: "What is always yours but others use it more?", a: ["name","a name","the name"], hint: "4 letters" },
    { q: "What gets bigger when more is taken away?", a: ["hole","a hole","the hole"], hint: "4 letters" },
    { q: "What runs but has no legs, cries but has no eyes?", a: ["cloud","a cloud","the cloud"], hint: "5 letters" },
    { q: "What has no life but can die instantly?", a: ["battery","a battery","the battery"], hint: "7 letters" },
    { q: "What flies without wings and cries without eyes?", a: ["cloud","a cloud","the cloud"], hint: "5 letters" },
    { q: "What has no brain but makes decisions?", a: ["algorithm","an algorithm","the algorithm"], hint: "9 letters" },
    { q: "What has no body but controls bodies?", a: ["mind","a mind","the mind"], hint: "4 letters" },
    { q: "What has no beginning but has always existed?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What is invisible but makes things visible?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no edge but can cut deeply?", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "What has no weight but can crush you?", a: ["pressure","a pressure","the pressure"], hint: "8 letters" },
    { q: "What has no length but measures everything?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no language but is understood worldwide?", a: ["emotion","an emotion","the emotion"], hint: "7 letters" },
    { q: "What has no face but shows expressions?", a: ["emoji","an emoji","the emoji"], hint: "5 letters" },
    { q: "What has no reality but shapes decisions?", a: ["fear","a fear","the fear"], hint: "4 letters" },
    { q: "What has no color but defines all colors?", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "What has no origin but defines existence?", a: ["universe","an universe","the universe"], hint: "8 letters" },
    { q: "What has no direction but leads everywhere?", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "What has no sound but can start wars?", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "What has no limit but ends lives?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no substance but builds worlds?", a: ["imagination","an imagination","the imagination"], hint: "11 letters" },
    { q: "What has no memory but stores everything?", a: ["data","a data","the data"], hint: "4 letters" },
    { q: "What has no movement but changes everything?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "What has no presence but is always felt?", a: ["gravity","a gravity","the gravity"], hint: "7 letters" },
    { q: "What has no shape but controls space?", a: ["gravity","a gravity","the gravity"], hint: "7 letters" },
    { q: "What has no end but defines endings?", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I exist only when you look for me, but disappear when you find me.", a: ["mystery","a mystery","the mystery"], hint: "7 letters" },
    { q: "I am created by you but can destroy you.", a: ["fear","a fear","the fear"], hint: "4 letters" },
    { q: "I grow stronger when shared, weaker when hidden.", a: ["truth","a truth","the truth"], hint: "5 letters" },
    { q: "I am always there, yet you never see me directly.", a: ["air","an air","the air"], hint: "3 letters" },
    { q: "I can travel faster than light, yet never move.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I shape reality but have no physical form.", a: ["belief","a belief","the belief"], hint: "6 letters" },
    { q: "I can be broken without being touched.", a: ["trust","a trust","the trust"], hint: "5 letters" },
    { q: "I live in the past but affect the future.", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "I am free but priceless.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I can exist forever or vanish instantly.", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "I have no weight but can crush souls.", a: ["guilt","a guilt","the guilt"], hint: "5 letters" },
    { q: "I have no voice but can silence crowds.", a: ["presence","a presence","the presence"], hint: "8 letters" },
    { q: "I have no body but can fill a room.", a: ["tension","a tension","the tension"], hint: "7 letters" },
    { q: "I have no face but can scare you.", a: ["darkness","a darkness","the darkness"], hint: "8 letters" },
    { q: "I am invisible but leave marks everywhere.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I can’t be seen but can be measured.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I have no color but define all colors.", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "I can build or destroy worlds.", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "I have no limit but always end.", a: ["life","a life","the life"], hint: "4 letters" },
    { q: "I exist between moments.", a: ["now","a now","the now"], hint: "3 letters" },
    { q: "I am always moving but never change.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I am always changing but never move.", a: ["shadow","a shadow","the shadow"], hint: "6 letters" },
    { q: "I can’t be touched but can hurt deeply.", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "I can exist in silence but speak loudly.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I can’t be owned but can be wasted.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I am always there but rarely noticed.", a: ["breath","a breath","the breath"], hint: "6 letters" },
    { q: "I have no body but control bodies.", a: ["mind","a mind","the mind"], hint: "4 letters" },
    { q: "I can be given but never taken back.", a: ["word","a word","the word"], hint: "4 letters" },
    { q: "I exist only when you believe.", a: ["faith","a faith","the faith"], hint: "5 letters" },
    { q: "I disappear when exposed.", a: ["secret","a secret","the secret"], hint: "6 letters" },
    { q: "I grow when fed but die when given drink.", a: ["fire","a fire","the fire"], hint: "4 letters" },
    { q: "I have no beginning but everything starts from me.", a: ["zero","a zero","the zero"], hint: "4 letters" },
    { q: "I can multiply without growing.", a: ["numbers","a numbers","the numbers"], hint: "7 letters" },
    { q: "I have no voice but command armies.", a: ["orders","an orders","the orders"], hint: "6 letters" },
    { q: "I can exist in nothingness.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I shape decisions without logic.", a: ["emotion","an emotion","the emotion"], hint: "7 letters" },
    { q: "I have no speed but outrun everything.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I am constant but always changing.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I define existence but cannot be touched.", a: ["reality","a reality","the reality"], hint: "7 letters" },
    { q: "I am infinite yet limited.", a: ["universe","an universe","the universe"], hint: "8 letters" },
    { q: "I can be created instantly but last forever.", a: ["memory","a memory","the memory"], hint: "6 letters" },
    { q: "I can’t be seen but reveals everything.", a: ["light","a light","the light"], hint: "5 letters" },
    { q: "I am always ahead but never reachable.", a: ["future","a future","the future"], hint: "6 letters" },
    { q: "I am always behind but never gone.", a: ["past","a past","the past"], hint: "4 letters" },
    { q: "I can exist without space.", a: ["thought","a thought","the thought"], hint: "7 letters" },
    { q: "I can destroy without force.", a: ["words","a words","the words"], hint: "5 letters" },
    { q: "I can exist without time.", a: ["idea","an idea","the idea"], hint: "4 letters" },
    { q: "I am everywhere but nowhere.", a: ["space","a space","the space"], hint: "5 letters" },
    { q: "I am nothing but everything depends on me.", a: ["time","a time","the time"], hint: "4 letters" },
    { q: "I end everything but never begin.", a: ["death","a death","the death"], hint: "5 letters" },
  ],
};

interface Props {
  difficulty: ChallengeDifficulty;
  onComplete: () => void;
  onFail: () => void;
}

export const RiddleChallenge: React.FC<Props> = ({ difficulty, onComplete, onFail }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const pool = difficulty === 1 ? RIDDLES.easy : difficulty === 2 ? RIDDLES.medium : RIDDLES.hard;
  const [riddle] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const diffLabel = difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard';

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;
    const cleaned = answer.trim().toLowerCase();
    const isCorrect = riddle.a.some(acc => acc.toLowerCase() === cleaned);

    if (isCorrect) {
      setFeedback('correct');
      Vibration.vibrate([0, 100, 50, 100]);
      setTimeout(() => onComplete(), 800);
    } else {
      setFeedback('wrong');
      shake();
      Vibration.vibrate([0, 400]);
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        onFail();
      }, 1000);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              {/* The riddle itself — big, direct, no chrome */}
              <Text style={styles.questionText}>{riddle.q}</Text>

              {/* Hint — easy only */}
              {difficulty === 1 && (
                <TouchableOpacity
                  style={styles.hintBtn}
                  onPress={() => setShowHint(!showHint)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hintBtnText}>
                    {showHint ? 'Hide hint' : 'Show hint'}
                  </Text>
                </TouchableOpacity>
              )}
              {showHint && (
                <Text style={styles.hintText}>{riddle.hint}</Text>
              )}
            </ScrollView>

            {/* Answer section — always at bottom above keyboard */}
            <View style={styles.answerSection}>
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <TextInput
                  style={[
                    styles.input,
                    feedback === 'correct' && styles.inputCorrect,
                    feedback === 'wrong' && styles.inputWrong,
                  ]}
                  placeholder="Type your answer…"
                  placeholderTextColor={isDark ? colors.subtext : 'rgba(46,30,26,0.3)'}
                  value={answer}
                  onChangeText={setAnswer}
                  autoCorrect={false}
                  autoCapitalize="none"
                  onSubmitEditing={checkAnswer}
                  returnKeyType="done"
                  autoFocus
                  selectionColor="#FF7F62"
                />
              </Animated.View>

              <TouchableOpacity
                style={[styles.primaryBtn, !answer.trim() && styles.primaryBtnDisabled]}
                onPress={checkAnswer}
                disabled={!answer.trim() || feedback !== null}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryBtnText, !answer.trim() && styles.primaryBtnTextDisabled]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF7F62',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 28,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 28,
    textAlign: 'center',
  },
  hintBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  hintBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7F62',
    letterSpacing: 0.3,
  },
  hintText: {
    fontSize: 15,
    color: colors.subtext,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  answerSection: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    gap: 12,
  },
  input: {
    height: 56,
    backgroundColor: isDark ? colors.surface : '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: isDark ? colors.border : 'rgba(46,30,26,0.1)',
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  inputCorrect: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52,199,89,0.04)',
  },
  inputWrong: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.04)',
  },
  primaryBtn: {
    backgroundColor: '#FF7F62',
    borderRadius: 30,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: isDark ? colors.surface : 'rgba(46,30,26,0.04)',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryBtnTextDisabled: {
    color: colors.subtext,
  },
});
>>>>>>> origin/main
