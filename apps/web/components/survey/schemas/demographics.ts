/**
 * Demographics survey schema for alignment-comparator research.
 *
 * Collects basic participant information for research context.
 * All questions are designed to be non-identifying while providing
 * useful demographic variables for analysis.
 *
 * Version: 1.0.0
 * Last updated: 2026-01-17
 */
export const demographicsSurvey = {
  title: 'About You',
  description:
    'Please answer a few questions about yourself. This helps us understand who is participating in this research. All responses are anonymous.',
  logoPosition: 'right',
  showQuestionNumbers: 'off',
  showProgressBar: 'top',
  progressBarType: 'questions',
  pages: [
    {
      name: 'page1',
      title: 'Basic Information',
      elements: [
        {
          type: 'dropdown',
          name: 'age_range',
          title: 'What is your age range?',
          isRequired: true,
          choices: [
            { value: '18-24', text: '18-24 years' },
            { value: '25-34', text: '25-34 years' },
            { value: '35-44', text: '35-44 years' },
            { value: '45-54', text: '45-54 years' },
            { value: '55-64', text: '55-64 years' },
            { value: '65+', text: '65 years or older' },
            { value: 'prefer_not_to_say', text: 'Prefer not to say' },
          ],
        },
        {
          type: 'dropdown',
          name: 'gender',
          title: 'How do you describe your gender?',
          isRequired: true,
          choices: [
            { value: 'woman', text: 'Woman' },
            { value: 'man', text: 'Man' },
            { value: 'non_binary', text: 'Non-binary' },
            { value: 'other', text: 'Other identity' },
            { value: 'prefer_not_to_say', text: 'Prefer not to say' },
          ],
        },
        {
          type: 'dropdown',
          name: 'education',
          title: 'What is your highest level of education?',
          isRequired: true,
          choices: [
            { value: 'secondary', text: 'Secondary school / High school' },
            { value: 'some_university', text: 'Some university/college' },
            { value: 'bachelors', text: "Bachelor's degree" },
            { value: 'masters', text: "Master's degree" },
            { value: 'doctorate', text: 'Doctorate or professional degree' },
            { value: 'prefer_not_to_say', text: 'Prefer not to say' },
          ],
        },
      ],
    },
    {
      name: 'page2',
      title: 'Technology Background',
      elements: [
        {
          type: 'radiogroup',
          name: 'ai_familiarity',
          title: 'How familiar are you with AI assistants (like ChatGPT, Claude, etc.)?',
          isRequired: true,
          choices: [
            { value: 'never_used', text: 'I have never used one' },
            { value: 'tried_once', text: 'I have tried one once or twice' },
            { value: 'occasional', text: 'I use them occasionally (monthly)' },
            { value: 'regular', text: 'I use them regularly (weekly)' },
            { value: 'daily', text: 'I use them daily' },
          ],
        },
        {
          type: 'radiogroup',
          name: 'tech_background',
          title: 'Do you have a background in technology, computing, or AI?',
          isRequired: true,
          choices: [
            { value: 'none', text: 'No technical background' },
            { value: 'some_knowledge', text: 'Some knowledge (self-taught, courses)' },
            { value: 'degree', text: 'Degree in a technical field' },
            { value: 'professional', text: 'Work professionally in technology' },
            { value: 'ai_specialist', text: 'Work specifically in AI/ML' },
          ],
        },
      ],
    },
    {
      name: 'page3',
      title: 'Research Context',
      elements: [
        {
          type: 'checkbox',
          name: 'interest_areas',
          title: 'What aspects of AI are you most interested in? (Select all that apply)',
          isRequired: false,
          choices: [
            { value: 'safety', text: 'AI safety and alignment' },
            { value: 'ethics', text: 'AI ethics and fairness' },
            { value: 'creativity', text: 'AI for creative work' },
            { value: 'productivity', text: 'AI for productivity' },
            { value: 'research', text: 'AI research and development' },
            { value: 'policy', text: 'AI policy and governance' },
            { value: 'none', text: 'None of the above' },
          ],
        },
        {
          type: 'radiogroup',
          name: 'participation_reason',
          title: 'What is your primary reason for participating in this research?',
          isRequired: true,
          choices: [
            { value: 'curious', text: 'Curiosity about the topic' },
            { value: 'contribute', text: 'Wanting to contribute to research' },
            { value: 'learn', text: 'Interest in learning about AI alignment' },
            { value: 'academic', text: 'Academic or professional interest' },
            { value: 'other', text: 'Other reason' },
          ],
        },
      ],
    },
  ],
  completedHtml:
    '<div class="text-center py-8"><h3 class="text-xl font-semibold mb-2">Thank you!</h3><p class="text-muted-foreground">Your responses have been recorded. Click continue to proceed.</p></div>',
  showCompletedPage: true,
}
