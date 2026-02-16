// Mental Age Test - Quiz Data
// 15 questions, 4 options each, score 1-5 per option
// Lower total = younger mental age, higher = older

const AGE_CATEGORIES = {
    youngSoul: {
        id: 'youngSoul',
        emoji: '\ud83e\uddd2',
        range: '15-22',
        minScore: 15,
        maxScore: 30,
        nameKey: 'age.youngSoul',
        taglineKey: 'age.youngSoul_tagline',
        descriptionKey: 'age.youngSoul_description',
        traitsKey: ['age.youngSoul_trait_1', 'age.youngSoul_trait_2', 'age.youngSoul_trait_3'],
        tipsKey: ['age.youngSoul_tip_1', 'age.youngSoul_tip_2'],
        famousKey: 'age.youngSoul_famous'
    },
    freshMind: {
        id: 'freshMind',
        emoji: '\ud83c\udf1f',
        range: '23-30',
        minScore: 31,
        maxScore: 42,
        nameKey: 'age.freshMind',
        taglineKey: 'age.freshMind_tagline',
        descriptionKey: 'age.freshMind_description',
        traitsKey: ['age.freshMind_trait_1', 'age.freshMind_trait_2', 'age.freshMind_trait_3'],
        tipsKey: ['age.freshMind_tip_1', 'age.freshMind_tip_2'],
        famousKey: 'age.freshMind_famous'
    },
    balancedThinker: {
        id: 'balancedThinker',
        emoji: '\u2696\ufe0f',
        range: '31-40',
        minScore: 43,
        maxScore: 52,
        nameKey: 'age.balancedThinker',
        taglineKey: 'age.balancedThinker_tagline',
        descriptionKey: 'age.balancedThinker_description',
        traitsKey: ['age.balancedThinker_trait_1', 'age.balancedThinker_trait_2', 'age.balancedThinker_trait_3'],
        tipsKey: ['age.balancedThinker_tip_1', 'age.balancedThinker_tip_2'],
        famousKey: 'age.balancedThinker_famous'
    },
    wiseMind: {
        id: 'wiseMind',
        emoji: '\ud83c\udfaf',
        range: '41-50',
        minScore: 53,
        maxScore: 60,
        nameKey: 'age.wiseMind',
        taglineKey: 'age.wiseMind_tagline',
        descriptionKey: 'age.wiseMind_description',
        traitsKey: ['age.wiseMind_trait_1', 'age.wiseMind_trait_2', 'age.wiseMind_trait_3'],
        tipsKey: ['age.wiseMind_tip_1', 'age.wiseMind_tip_2'],
        famousKey: 'age.wiseMind_famous'
    },
    oldSoul: {
        id: 'oldSoul',
        emoji: '\ud83d\udcda',
        range: '51-60',
        minScore: 61,
        maxScore: 68,
        nameKey: 'age.oldSoul',
        taglineKey: 'age.oldSoul_tagline',
        descriptionKey: 'age.oldSoul_description',
        traitsKey: ['age.oldSoul_trait_1', 'age.oldSoul_trait_2', 'age.oldSoul_trait_3'],
        tipsKey: ['age.oldSoul_tip_1', 'age.oldSoul_tip_2'],
        famousKey: 'age.oldSoul_famous'
    },
    ancientSage: {
        id: 'ancientSage',
        emoji: '\ud83e\udd89',
        range: '61-75',
        minScore: 69,
        maxScore: 75,
        nameKey: 'age.ancientSage',
        taglineKey: 'age.ancientSage_tagline',
        descriptionKey: 'age.ancientSage_description',
        traitsKey: ['age.ancientSage_trait_1', 'age.ancientSage_trait_2', 'age.ancientSage_trait_3'],
        tipsKey: ['age.ancientSage_tip_1', 'age.ancientSage_tip_2'],
        famousKey: 'age.ancientSage_famous'
    }
};

const QUIZ_QUESTIONS = [
    {
        id: 1,
        textKey: 'question.1',
        options: [
            { textKey: 'option.1_1', score: 1 },
            { textKey: 'option.1_2', score: 2 },
            { textKey: 'option.1_3', score: 3 },
            { textKey: 'option.1_4', score: 4 }
        ]
    },
    {
        id: 2,
        textKey: 'question.2',
        options: [
            { textKey: 'option.2_1', score: 1 },
            { textKey: 'option.2_2', score: 2 },
            { textKey: 'option.2_3', score: 3 },
            { textKey: 'option.2_4', score: 4 }
        ]
    },
    {
        id: 3,
        textKey: 'question.3',
        options: [
            { textKey: 'option.3_1', score: 1 },
            { textKey: 'option.3_2', score: 2 },
            { textKey: 'option.3_3', score: 3 },
            { textKey: 'option.3_4', score: 4 }
        ]
    },
    {
        id: 4,
        textKey: 'question.4',
        options: [
            { textKey: 'option.4_1', score: 1 },
            { textKey: 'option.4_2', score: 2 },
            { textKey: 'option.4_3', score: 3 },
            { textKey: 'option.4_4', score: 4 }
        ]
    },
    {
        id: 5,
        textKey: 'question.5',
        options: [
            { textKey: 'option.5_1', score: 1 },
            { textKey: 'option.5_2', score: 2 },
            { textKey: 'option.5_3', score: 3 },
            { textKey: 'option.5_4', score: 4 }
        ]
    },
    {
        id: 6,
        textKey: 'question.6',
        options: [
            { textKey: 'option.6_1', score: 1 },
            { textKey: 'option.6_2', score: 2 },
            { textKey: 'option.6_3', score: 3 },
            { textKey: 'option.6_4', score: 4 }
        ]
    },
    {
        id: 7,
        textKey: 'question.7',
        options: [
            { textKey: 'option.7_1', score: 1 },
            { textKey: 'option.7_2', score: 2 },
            { textKey: 'option.7_3', score: 3 },
            { textKey: 'option.7_4', score: 4 }
        ]
    },
    {
        id: 8,
        textKey: 'question.8',
        options: [
            { textKey: 'option.8_1', score: 1 },
            { textKey: 'option.8_2', score: 2 },
            { textKey: 'option.8_3', score: 3 },
            { textKey: 'option.8_4', score: 4 }
        ]
    },
    {
        id: 9,
        textKey: 'question.9',
        options: [
            { textKey: 'option.9_1', score: 1 },
            { textKey: 'option.9_2', score: 2 },
            { textKey: 'option.9_3', score: 3 },
            { textKey: 'option.9_4', score: 4 }
        ]
    },
    {
        id: 10,
        textKey: 'question.10',
        options: [
            { textKey: 'option.10_1', score: 1 },
            { textKey: 'option.10_2', score: 2 },
            { textKey: 'option.10_3', score: 3 },
            { textKey: 'option.10_4', score: 4 }
        ]
    },
    {
        id: 11,
        textKey: 'question.11',
        options: [
            { textKey: 'option.11_1', score: 1 },
            { textKey: 'option.11_2', score: 2 },
            { textKey: 'option.11_3', score: 3 },
            { textKey: 'option.11_4', score: 4 }
        ]
    },
    {
        id: 12,
        textKey: 'question.12',
        options: [
            { textKey: 'option.12_1', score: 1 },
            { textKey: 'option.12_2', score: 2 },
            { textKey: 'option.12_3', score: 3 },
            { textKey: 'option.12_4', score: 4 }
        ]
    },
    {
        id: 13,
        textKey: 'question.13',
        options: [
            { textKey: 'option.13_1', score: 1 },
            { textKey: 'option.13_2', score: 2 },
            { textKey: 'option.13_3', score: 3 },
            { textKey: 'option.13_4', score: 4 }
        ]
    },
    {
        id: 14,
        textKey: 'question.14',
        options: [
            { textKey: 'option.14_1', score: 1 },
            { textKey: 'option.14_2', score: 2 },
            { textKey: 'option.14_3', score: 3 },
            { textKey: 'option.14_4', score: 4 }
        ]
    },
    {
        id: 15,
        textKey: 'question.15',
        options: [
            { textKey: 'option.15_1', score: 1 },
            { textKey: 'option.15_2', score: 2 },
            { textKey: 'option.15_3', score: 3 },
            { textKey: 'option.15_4', score: 4 }
        ]
    }
];

/**
 * Calculate mental age from answer scores.
 * Each answer score is 1-4, total range is 15-60.
 * Maps to mental age 15-75.
 * @param {number[]} answers - Array of score values from selected options
 * @returns {number} Mental age between 15 and 75
 */
function calculateMentalAge(answers) {
    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    // Total score range: 15 (all 1s) to 60 (all 4s)
    // Map to mental age range: 15-75
    // Linear mapping: mentalAge = 15 + (totalScore - 15) * (75 - 15) / (60 - 15)
    const mentalAge = Math.round(15 + (totalScore - 15) * (60 / 45));
    // Clamp between 15 and 75
    return Math.max(15, Math.min(75, mentalAge));
}

/**
 * Get age category based on mental age number.
 * @param {number} mentalAge - Calculated mental age (15-75)
 * @returns {Object} Age category object
 */
function getAgeCategory(mentalAge) {
    if (mentalAge <= 22) return AGE_CATEGORIES.youngSoul;
    if (mentalAge <= 30) return AGE_CATEGORIES.freshMind;
    if (mentalAge <= 40) return AGE_CATEGORIES.balancedThinker;
    if (mentalAge <= 50) return AGE_CATEGORIES.wiseMind;
    if (mentalAge <= 60) return AGE_CATEGORIES.oldSoul;
    return AGE_CATEGORIES.ancientSage;
}

// Recommended apps for cross-promotion
const RECOMMENDED_APPS = [
    { id: 'brain-type', emoji: '\ud83e\udde0', nameKey: 'recommend.brainType' },
    { id: 'color-personality', emoji: '\ud83c\udfa8', nameKey: 'recommend.colorPersonality' },
    { id: 'stress-test', emoji: '\ud83d\udca1', nameKey: 'recommend.stressTest' }
];
