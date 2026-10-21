import type { ResearchArticle } from "./language-articles";

/**
 * Native-speaker-supplied Study 008–011 material, documented in October 2026.
 * Keep every Kutchi form and user-provided English meaning as supplied;
 * proposed syntactic roles must remain explicitly identified as hypotheses.
 */
export const octoberResearchArticles: ResearchArticle[] = [
  {
    "slug": "la-and-jo-beneficiary-and-possession",
    "editorialDate": "2026-10-21",
    "number": "06",
    "subject": "Postpositions and possession",
    "title": "La and jo: Beneficiaries and possession in Mombasa Kutchi",
    "summary": "A paired example distinguishes doing something for a person from handling property that belongs to that person.",
    "introduction": "The recorded sentences distinguish la in a benefactive construction from jo in a possessive construction. One sentence describes picking up money for a man; the other refers to the man's money. The difference matters for grammatical analysis and future dictionary work. The study retains the exact Kutchi forms and translations rather than reducing both particles to one English gloss.",
    "illustration": "/language/research/la-jo-relations.svg",
    "illustrationAlt": "Original abstract editorial artwork with separate connected shapes illustrating a beneficiary relation and a possession relation, using Madhaaf's forest-green and terracotta palette.",
    "wordNotes": [
      {
        "word": "la",
        "meaning": "‘For’ in the attested examples, including a beneficiary and a food-related purpose or exchange."
      },
      {
        "word": "jo",
        "meaning": "Possessive relation (‘of’, ‘-’s’) in Hin jo pe(n)sa and mujo bhaa jo ghar; an earlier word list also glosses jo as ‘for’."
      },
      {
        "word": "hin",
        "meaning": "Person referred to by ‘him’ in Hin la, and possessor in Hin jo."
      },
      {
        "word": "pe(n)sa",
        "meaning": "Money."
      },
      {
        "word": "au(n)",
        "meaning": "First-person singular: I."
      },
      {
        "word": "kayose",
        "meaning": "Picked up in these sentences; compare the recorded past form of the verb kan (‘take’).",
        "search": "kan"
      },
      {
        "word": "khadho",
        "meaning": "Food; recorded with la in a food-related phrase."
      },
      {
        "word": "khade",
        "meaning": "Form referring to food before la; relationship to khadho remains unresolved.",
        "search": "khadho"
      },
      {
        "word": "mukhe",
        "meaning": "‘To me’ / recipient form in the giving sentence."
      },
      {
        "word": "ke",
        "meaning": "Marks the recipient in the earlier example involving giving food to a man."
      },
      {
        "word": "bhaa",
        "meaning": "Brother in a recorded possessive expression."
      },
      {
        "word": "hinjo",
        "meaning": "‘His’ in Hinjo ghar; contrast with separate Hin jo has not been tested."
      }
    ],
    "sections": [
      {
        "id": "money-pair",
        "title": "The two sentences that made the difference clear",
        "blocks": [
          {
            "type": "text",
            "text": "The speaker was asked to translate ‘I picked up money for him’ and ‘I picked up his money’. The contexts differ in whether the man benefits from an action or owns the money. The two supplied translations are shown below."
          },
          {
            "type": "examples",
            "label": "A native-speaker meaning contrast",
            "items": [
              {
                "kutchi": "Hin la au(n) pe(n)sa kayose",
                "english": "I picked up money for him.",
                "context": "The man benefits from what I did"
              },
              {
                "kutchi": "Hin jo pe(n)sa au(n) kayose",
                "english": "I picked up his money.",
                "context": "The money is identified as his"
              }
            ]
          },
          {
            "type": "text",
            "text": "In the first sentence, the man benefits from the action without any claim that the money belongs to him. The second identifies the money as his. This contrast is supported by the supplied translations, rather than by a general assumption that la and jo both mean ‘for’."
          },
          {
            "type": "finding",
            "strength": "attested",
            "label": "A confirmed semantic contrast",
            "text": "In this pair, Hin la has a beneficiary reading (‘for him’), while Hin jo modifies pe(n)sa with a possessive reading (‘his money’). Because the phrases also occupy different positions, substituting one particle without changing the rest has not been tested."
          }
        ]
      },
      {
        "id": "la-for-someone-and-something",
        "title": "La and the expression of benefit or purpose",
        "blocks": [
          {
            "type": "text",
            "text": "Hin la identifies the person for whom the money was picked up. ‘Beneficiary’ is therefore a useful analysis for this context. Other recorded la phrases involve food and may express purpose, payment or exchange. Their exact range of meanings remains to be tested."
          },
          {
            "type": "examples",
            "label": "La in different attested situations",
            "items": [
              {
                "kutchi": "Hin la au(n) pe(n)sa kayose",
                "english": "I picked up money for him."
              },
              {
                "kutchi": "khadho la au(n) kana(n)tho",
                "english": "for the food, I am taking it."
              },
              {
                "kutchi": "Au(n) hikro maru ke khadho dhinose. Hoo maru mukhe pe(n)sa dhine, khade la.",
                "english": "I gave a man food. That man gave me money for the food."
              }
            ]
          },
          {
            "type": "text",
            "text": "Khadho la precedes the main clause in one example; khade la occurs at the end of a later clause in the food-and-money narrative. Since the contexts are different, this does not establish unrestricted movement of la phrases. It only documents the attested positions."
          },
          {
            "type": "finding",
            "strength": "hypothesis",
            "label": "What kind of postposition is la?",
            "text": "In the recorded forms, la follows a noun or pronoun phrase. A benefactive or purpose-related postposition is a plausible working analysis, but further examples are required to establish its distribution."
          }
        ]
      },
      {
        "id": "jo-possession",
        "title": "Jo connects a possessor with something possessed",
        "blocks": [
          {
            "type": "text",
            "text": "Hin jo pe(n)sa identifies the owner of the money. The earlier mujo bhaa jo ghar example similarly identifies who owns the house. Neither construction by itself describes the beneficiary of an action."
          },
          {
            "type": "examples",
            "label": "Recorded possession constructions",
            "items": [
              {
                "kutchi": "Hin jo pe(n)sa au(n) kayose",
                "english": "I picked up his money."
              },
              {
                "kutchi": "Hee mujo bhaa jo ghar ai",
                "english": "This is my brother's house."
              },
              {
                "kutchi": "Mujo ghar",
                "english": "My house.",
                "context": "Recorded possessive phrase"
              },
              {
                "kutchi": "Hinjo ghar",
                "english": "His house.",
                "context": "Recorded possessive phrase"
              }
            ]
          },
          {
            "type": "text",
            "text": "Jo has a possessive or genitive-like function in these examples. The record also includes mujo and hinjo as written possessive forms. It remains unclear whether spaced Hin jo and unspaced Hinjo behave identically. Original spelling is retained pending speaker confirmation."
          },
          {
            "type": "finding",
            "strength": "unresolved",
            "label": "The earlier dictionary gloss ‘for’ still matters",
            "text": "An earlier word list glossed jo as ‘for’. The current minimal comparison establishes a possessive reading for jo and a beneficiary reading for la, but does not rule out other uses of jo. Additional attested sentences are needed before revising the earlier dictionary gloss."
          }
        ]
      },
      {
        "id": "food-forms",
        "title": "The two attested forms khadho and khade",
        "blocks": [
          {
            "type": "text",
            "text": "The speaker explicitly accepted both khadho la and khade la for ‘for the food’. The acceptance judgment does not explain the difference between the noun forms. Similar alternations occur with chokro/chokre and ghar/ghare(n), but any connection to case must be tested."
          },
          {
            "type": "examples",
            "label": "Two forms accepted in this context",
            "items": [
              {
                "kutchi": "khadho la",
                "english": "for the food",
                "context": "Speaker-confirmed acceptable phrase"
              },
              {
                "kutchi": "khade la",
                "english": "for the food",
                "context": "Speaker-confirmed acceptable phrase"
              }
            ]
          },
          {
            "type": "finding",
            "strength": "attested",
            "label": "No obligatory khadho → khade rule",
            "text": "Both khadho la and khade la were accepted by the speaker. It is therefore not justified to claim that la obligatorily changes khadho to khade. Effects of emphasis, context or register remain unresolved."
          }
        ]
      },
      {
        "id": "beneficiary-recipient",
        "title": "A beneficiary is not necessarily a recipient or owner",
        "blocks": [
          {
            "type": "text",
            "text": "In Au(n) hikro maru ke khadho dhinose, ke follows a recipient. In Hin la au(n) pe(n)sa kayose, la identifies a beneficiary. In Hin jo pe(n)sa au(n) kayose, jo marks possession. These functions can overlap in real situations but are grammatically distinct in the recorded examples."
          },
          {
            "type": "table",
            "headers": [
              "Recorded expression",
              "Function in that example",
              "What it does not prove"
            ],
            "rows": [
              [
                "hikro maru ke",
                "Recipient of food in a giving event",
                "That ke means ‘for’ in all sentences"
              ],
              [
                "Hin la",
                "Beneficiary (‘for him’)",
                "That the beneficiary owns the money"
              ],
              [
                "Hin jo pe(n)sa",
                "Possessor (‘his money’)",
                "That jo and la are interchangeable"
              ],
              [
                "khadho la / khade la",
                "Food-related ‘for’ phrase",
                "That every noun must change before la"
              ]
            ],
            "caption": "The functions are interpretations grounded in the speaker's supplied English readings; the last column marks unsupported generalizations."
          },
          {
            "type": "text",
            "text": "Madhaaf dictionary entries should describe these relations in context, not collapse them into a single English equivalent. Complete example sentences are therefore part of each lexical analysis."
          }
        ]
      },
      {
        "id": "la-jo-next-tests",
        "title": "Questions for further elicitation",
        "blocks": [
          {
            "type": "questions",
            "items": [
              "Would I use the same la construction for a woman or a group? What happens to the preceding pronoun?",
              "Does Hinjo pe(n)sa mean the same as Hin jo pe(n)sa, and are both natural?",
              "Where can I use jo with an English ‘for’ meaning? Is it different from possessive jo?",
              "Does khadho versus khade change the context, tone, or meaning of a la phrase?",
              "Can I put the la phrase at the end of the money sentence without changing the meaning?"
            ]
          },
          {
            "type": "finding",
            "strength": "hypothesis",
            "label": "Provisional conclusion",
            "text": "The strongest current contrast is benefactive la versus possessive jo. This conclusion is limited to the documented examples and does not establish all possible functions of either particle."
          }
        ]
      }
    ]
  },
  {
    "slug": "negation-in-mombasa-kutchi",
    "editorialDate": "2026-10-21",
    "number": "07",
    "subject": "Negation and verb agreement",
    "title": "Negation in Mombasa Kutchi: Forms and constructions",
    "summary": "The recorded forms natho, nathi, nathaa, na, nah and nai suggest interactions between negation, agreement, tense and clause type.",
    "introduction": "The recorded Mombasa Kutchi examples distinguish several ways of expressing negation, including future-meaning negative sleeping, not giving money, and not having given money. An earlier draft incorrectly glossed Natho sume and Nathi sume as ‘is not sleeping’. The native speaker explicitly corrected both to ‘won't sleep’, and also clarified that Hee mukhe pe(n)sa nai dhine means ‘He hasn't given me money’, not a simple past negative. The evidence is analyzed here without imposing one tense meaning on each negative element.",
    "illustration": "/language/research/negation-patterns.svg",
    "illustrationAlt": "Original abstract editorial illustration of alternating light and dark circular forms connected by six paths, suggesting contrasting grammatical negative constructions.",
    "wordNotes": [
      {
        "word": "natho",
        "meaning": "Negative element in the confirmed ‘He won't sleep’ example, present negative giving, and other attested constructions. Not exclusively present or future."
      },
      {
        "word": "nathi",
        "meaning": "Negative element in ‘She won't sleep’ and in another feminine-context negative-giving elicitation. Agreement behavior is still under investigation."
      },
      {
        "word": "nathaa",
        "meaning": "Negative form recorded with plural desired things; agreement remains under investigation."
      },
      {
        "word": "na",
        "meaning": "Negative element recorded in Paa(n) kaal na oosyasee (‘We did not go yesterday’)."
      },
      {
        "word": "nah",
        "meaning": "Used for ‘don't’ in commands and in at least one future negative."
      },
      {
        "word": "nai",
        "meaning": "Negative in ‘He hasn't given me money’ and ‘there is no food’, plus an earlier permission example; not exclusively past or existential."
      },
      {
        "word": "sum",
        "meaning": "Sleep; compare sume in the speaker-confirmed future-meaning negative sentences."
      },
      {
        "word": "mukhe",
        "meaning": "First-person recipient/experiencer form used in several negative examples."
      },
      {
        "word": "pe(n)sa",
        "meaning": "Money."
      },
      {
        "word": "de",
        "meaning": "Give!; the recorded giving forms include dye, dhine, dhya(n) and dhineese."
      },
      {
        "word": "paani",
        "meaning": "Water."
      },
      {
        "word": "kapetho",
        "meaning": "Want in a singular desired-item context; compare kape(n) in a negative clause."
      },
      {
        "word": "se",
        "meaning": "Because in the father's-permission sentence."
      },
      {
        "word": "raja",
        "meaning": "Approval or permission in the father's-permission example; preserve this spelling separately from the dictionary's other raja/rajaa forms."
      },
      {
        "word": "kaal",
        "meaning": "Yesterday in the past-tense negative example."
      },
      {
        "word": "bapa",
        "meaning": "Father."
      },
      {
        "word": "hin",
        "meaning": "Person reference in hin ke; grammatical role remains unresolved in the feminine elicitation pair."
      }
    ],
    "sections": [
      {
        "id": "negative-gender",
        "title": "Natho and nathi in confirmed future-meaning sleep clauses",
        "blocks": [
          {
            "type": "text",
            "text": "The native speaker corrected the earlier glosses of Natho sume and Nathi sume. In the contexts supplied, these sentences mean ‘He won't sleep’ and ‘She won't sleep’, rather than ‘He is not sleeping’ and ‘She is not sleeping’. The forms still show a masculine/feminine contrast, but the future interpretation must be recorded at the construction level."
          },
          {
            "type": "examples",
            "label": "Future-meaning sleeping negatives confirmed by the speaker",
            "items": [
              {
                "kutchi": "Natho sume",
                "english": "He won't sleep.",
                "context": "Masculine subject; future meaning confirmed"
              },
              {
                "kutchi": "Nathi sume",
                "english": "She won't sleep.",
                "context": "Feminine subject; future meaning confirmed"
              }
            ]
          },
          {
            "type": "text",
            "text": "The negative element changes between natho and nathi while sume remains unchanged. This may indicate agreement expressed by the negative construction. However, natho also occurs in Hee mukhe pe(n)sa natho dye with a present negative reading, so neither natho nor nathi can be assigned an exclusively future meaning on this evidence."
          },
          {
            "type": "finding",
            "strength": "hypothesis",
            "label": "Agreement on the negative element",
            "text": "The recorded masculine and feminine future-meaning sleeping clauses support a gender distinction in this construction. Whether the negative form itself carries future reference, and how these forms behave across other persons or verbs, remains to be tested."
          },
          {
            "type": "finding",
            "strength": "attested",
            "label": "Correction to the earlier translations",
            "text": "The native speaker explicitly rejected the earlier progressive readings of Natho sume and Nathi sume and confirmed ‘He won't sleep’ and ‘She won't sleep’. The Kutchi forms are unchanged; only their translations and grammatical commentary are corrected."
          }
        ]
      },
      {
        "id": "giving-time",
        "title": "Present negative giving and ‘hasn't given’",
        "blocks": [
          {
            "type": "text",
            "text": "The same subject, recipient, and money appear in both giving examples, but their supplied English interpretations differ. Hee mukhe pe(n)sa natho dye means ‘He doesn't give me money’. The speaker corrected Hee mukhe pe(n)sa nai dhine to ‘He hasn't given me money’, not ‘He didn't give me money’. The negative element and giving verb both change."
          },
          {
            "type": "examples",
            "label": "A controlled translation contrast",
            "items": [
              {
                "kutchi": "Hee mukhe pe(n)sa natho dye",
                "english": "He doesn't give me money.",
                "context": "Present negative"
              },
              {
                "kutchi": "Hee mukhe pe(n)sa nai dhine",
                "english": "He hasn't given me money.",
                "context": "Confirmed ‘hasn't given’ interpretation"
              }
            ]
          },
          {
            "type": "table",
            "headers": [
              "Element",
              "Doesn't give",
              "Hasn't given"
            ],
            "rows": [
              [
                "Giver/subject",
                "Hee",
                "Hee"
              ],
              [
                "Recipient",
                "mukhe",
                "mukhe"
              ],
              [
                "Thing given",
                "pe(n)sa",
                "pe(n)sa"
              ],
              [
                "Negative element",
                "natho",
                "nai"
              ],
              [
                "Giving form",
                "dye",
                "dhine"
              ]
            ],
            "caption": "Both the negative element and the form of ‘give’ change. The corrected English translations are speaker confirmed; the exact morphological source of the completed or currently relevant reading is not established."
          },
          {
            "type": "text",
            "text": "This pair does not demonstrate that nai alone marks the English present perfect. The forms natho and nai differ, as do dye and dhine. It would be premature to derive a universal tense-aspect or agreement rule from this one contrast."
          }
        ]
      },
      {
        "id": "female-elicitation",
        "title": "Unresolved participant roles in the feminine-subject examples",
        "blocks": [
          {
            "type": "text",
            "text": "The speaker also supplied present and past negative giving sentences in response to a prompt about a female giver. The exact grammatical roles of hin ke and au(n) were not independently confirmed for these sentences. This limits any analysis of feminine agreement; the forms are published without an invented parsing."
          },
          {
            "type": "examples",
            "label": "Exact forms from feminine-subject elicitation ,  not independent English translations",
            "items": [
              {
                "kutchi": "Hin ke au(n) pe(n)sa nai dhineese",
                "english": "Past-negative form elicited in response to a female-giver prompt; participant roles remain to be checked.",
                "context": "Past elicitation",
                "captionKind": "elicitation"
              },
              {
                "kutchi": "hin ke au(n) pe(n)sa nathi dhya(n)",
                "english": "Present-negative form elicited in response to a female-giver prompt; participant roles remain to be checked.",
                "context": "Present elicitation",
                "captionKind": "elicitation"
              }
            ]
          },
          {
            "type": "finding",
            "strength": "unresolved",
            "label": "Agreement needs its grammatical controller",
            "text": "The speaker identified the intended tense in each response but did not separately confirm who gave and who received money in these exact sentences. Neither dhineese nor dhya(n) can therefore be assigned a feminine suffix on this evidence alone, nor can hin ke be labeled the subject."
          }
        ]
      },
      {
        "id": "negative-commands-and-future",
        "title": "Nah in prohibitions and future contexts",
        "blocks": [
          {
            "type": "text",
            "text": "Nah appears before commands in several attested prohibitions and also appears with a future-tense form. It should not be described as an exclusively imperative marker."
          },
          {
            "type": "examples",
            "label": "Prohibitions and a future negative",
            "items": [
              {
                "kutchi": "Nah sum!",
                "english": "Don't sleep!",
                "context": "Negative imperative"
              },
              {
                "kutchi": "Nah vin",
                "english": "Don't go!",
                "context": "Negative imperative"
              },
              {
                "kutchi": "Nah kar",
                "english": "Don't do it!",
                "context": "Negative imperative"
              },
              {
                "kutchi": "Nah vendhose",
                "english": "I will not go.",
                "context": "Future negative context"
              }
            ]
          },
          {
            "type": "finding",
            "strength": "attested",
            "label": "An observed, not universal, command pattern",
            "text": "The prohibitions include nah before sum, vin and kar. The earlier Nah vendhose example supplies another environment. Plural, polite and additional future-negative forms remain to be tested."
          }
        ]
      },
      {
        "id": "na-and-nai",
        "title": "Nai: completed giving, absence, and permission",
        "blocks": [
          {
            "type": "text",
            "text": "The examples include na in ‘We did not go yesterday’, nai in a sentence meaning ‘there is no food’, and nai dhine in a sentence now confirmed as ‘He hasn't given me money’. Those meanings are not interchangeable. The present evidence does not justify treating nai as an exclusively past-tense or exclusively existential negative."
          },
          {
            "type": "examples",
            "label": "Three recorded negative environments",
            "items": [
              {
                "kutchi": "Paa(n) kaal na oosyasee",
                "english": "We did not go yesterday.",
                "context": "Past negative with na"
              },
              {
                "kutchi": "Mukhe kheno ai, pun khadho nai",
                "english": "I want to eat, but there is no food.",
                "context": "Negative existence with nai"
              },
              {
                "kutchi": "Natho kanaa(n) se mujo bapa mukhe raja nai dhine",
                "english": "I am not taking it because my father has not allowed me to do so.",
                "context": "A reason clause with nai dhine"
              }
            ]
          },
          {
            "type": "text",
            "text": "Nai dhine also appears in the explanation of why permission was not given by a father. That is compatible with the corrected ‘hasn't given’ sentence, but it does not independently isolate the contribution of nai, dhine, or their combination."
          },
          {
            "type": "finding",
            "strength": "unresolved",
            "label": "Generalizations not supported by the data",
            "text": "Nai appears in negative existence, money that he hasn't given, and permission not granted. Na is recorded in a different past negative. A fuller distributional and aspectual analysis requires matched contexts across more verbs and persons."
          }
        ]
      },
      {
        "id": "not-wanting",
        "title": "Negation in desire constructions",
        "blocks": [
          {
            "type": "text",
            "text": "Desire constructions with a singular desired item paani (‘water’) use natho, while recorded examples with several desired things use nathaa. This raises the question of which grammatical element controls agreement when the experiencer is expressed by mukhe or hin ke."
          },
          {
            "type": "examples",
            "label": "Desire and negative agreement",
            "items": [
              {
                "kutchi": "paani mukhe natho kape",
                "english": "I don't want water."
              },
              {
                "kutchi": "paani hin ke natho kape",
                "english": "He doesn't want water."
              },
              {
                "kutchi": "Mukhe hinee cheejeu(n) nathaa kape(n)",
                "english": "I don't want these things."
              },
              {
                "kutchi": "Mukhe paani kapetho",
                "english": "I want water.",
                "context": "Earlier affirmative comparison"
              }
            ]
          },
          {
            "type": "text",
            "text": "The plural cheejeu(n) example contains nathaa. Feminine desired nouns and more plural clauses are needed to determine which argument controls the form. The negative paani construction places water before the experiencer, unlike the affirmative example. Since other variables were not held constant, negation cannot yet be identified as the cause of the word-order difference."
          }
        ]
      },
      {
        "id": "negative-inventory",
        "title": "Recorded negatives without a complete paradigm",
        "blocks": [
          {
            "type": "table",
            "headers": [
              "Negative form",
              "Documented context",
              "What I still need to establish"
            ],
            "rows": [
              [
                "natho",
                "‘He won't sleep’; present negative giving; negative desire",
                "Full agreement system and distribution"
              ],
              [
                "nathi",
                "‘She won't sleep’; feminine-context negative giving elicitation",
                "Which participant controls agreement in giving"
              ],
              [
                "nathaa",
                "Negative desire with plural cheejeu(n)",
                "Whether it agrees with desired-item plurality"
              ],
              [
                "na",
                "We did not go yesterday",
                "Other tenses and clause types"
              ],
              [
                "nah",
                "Do not sleep/go/do; future negative Nah vendhose",
                "Future/imperative distribution across subjects"
              ],
              [
                "nai",
                "‘There is no food’; ‘hasn't given’ money; denied permission",
                "Whether one or several constructions are involved"
              ]
            ],
            "caption": "Each row is grounded in an attested form. This is a distributional inventory, not a predictive conjugation table."
          },
          {
            "type": "text",
            "text": "Full sentences are necessary for analysing negation because a single gloss for ‘not’ does not show which form occurs with a particular verb, tense, argument or clause type. General rules must remain proportional to the available evidence."
          },
          {
            "type": "questions",
            "items": [
              "In Hin ke au(n) pe(n)sa nai dhineese, exactly who is giving the money, and who is receiving it?",
              "How does a plural person, rather than a plural desired object, affect natho/nathi/nathaa?",
              "Can nai combine with other verbs in a ‘has not’ interpretation, and what distinguishes this from a simple past negative?",
              "Can I change the order of a negative sentence without changing the meaning or emphasis?",
              "How do I negate future clauses with feminine and plural subjects?"
            ]
          },
          {
            "type": "finding",
            "strength": "hypothesis",
            "label": "Provisional conclusion",
            "text": "Negative forms and accompanying verbs vary by grammatical context. The evidence does not yet establish a single rule that predicts every attested negative sentence."
          }
        ]
      }
    ]
  }
];
