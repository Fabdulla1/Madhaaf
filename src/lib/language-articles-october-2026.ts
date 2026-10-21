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
    "title": "For him, or his? What la and jo reveal about my Kutchi",
    "summary": "Two sentences about picking up money helped me separate doing something for someone from handling something that belongs to them.",
    "introduction": "There are small words in my Kutchi that I have used all my life without needing to explain them. La and jo are two of them. When I translated sentences about money, I realized the difference was not just a choice of English words. In one sentence, I picked up money for a man; in another, I picked up the man's money. I wanted to keep the exact Kutchi sentences next to each other, because this is the kind of distinction that a dictionary—or a future translator—could easily get wrong.",
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
            "text": "I was asked how I would say ‘I picked up money for him’ and ‘I picked up his money.’ Both are ordinary things I might want to say, but they are not the same situation. Here is how I expressed them:"
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
            "text": "In the first sentence, I am picking up money for him; I have not said the money belongs to him. In the second, I identify the money as his. That distinction is explicit in the English meanings I supplied. It is stronger evidence than simply saying that both la and jo can be translated as ‘for.’"
          },
          {
            "type": "finding",
            "strength": "attested",
            "label": "A confirmed semantic contrast",
            "text": "In this pair, Hin la has a beneficiary reading (‘for him’), while Hin jo modifies pe(n)sa with a possessive reading (‘his money’). The phrases also occur in different positions, so I have not shown that replacing one particle alone—without changing the rest of the construction—would produce a natural sentence."
          }
        ]
      },
      {
        "id": "la-for-someone-and-something",
        "title": "La can tell me who benefits—or what something is for",
        "blocks": [
          {
            "type": "text",
            "text": "With Hin la, I am identifying the person for whom I picked up the money. That makes ‘beneficiary’ a useful grammatical description for this particular use of la. But I have also used la in a phrase about food, where the relationship is closer to purpose, payment, or exchange. I do not want to flatten those readings into a universal definition too early."
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
            "text": "The phrase khadho la comes before the main clause in one example. The phrase khade la comes at the end of the second part of my food-and-money story. Because the surrounding sentences are different, I cannot yet claim that la phrases can move freely without affecting meaning. I can say that I have recorded them in more than one position."
          },
          {
            "type": "finding",
            "strength": "hypothesis",
            "label": "What kind of postposition is la?",
            "text": "La follows a noun or pronoun phrase in the forms I have supplied. A benefactive or purpose-related postposition is therefore a reasonable working analysis. I still need to test what other kinds of ‘for’ relationships it can express."
          }
        ]
      },
      {
        "id": "jo-possession",
        "title": "Jo connects a possessor with something possessed",
        "blocks": [
          {
            "type": "text",
            "text": "The other half of my money example uses Hin jo pe(n)sa: his money. That reminds me of an earlier sentence I supplied about my brother’s house. Both involve the identity of the person something belongs to, rather than who benefits from an action."
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
            "text": "This is enough for me to describe jo as a possessive or genitive-like element in these examples. I also have mujo and hinjo as written possessive forms. It is still an open question whether Hin jo and Hinjo behave identically in every context. The spaces in the recorded forms are part of the evidence; I will not normalize them into one spelling without checking."
          },
          {
            "type": "finding",
            "strength": "unresolved",
            "label": "The earlier dictionary gloss ‘for’ still matters",
            "text": "An earlier word list glossed jo as ‘for’. My new sentence pair specifically contrasts possessive jo with benefactive la; it does not establish that jo never has a ‘for’ reading elsewhere. I need a separate sentence demonstrating any additional function before changing or removing an existing dictionary sense."
          }
        ]
      },
      {
        "id": "food-forms",
        "title": "Why khadho and khade are both in my notes",
        "blocks": [
          {
            "type": "text",
            "text": "I was asked whether I could say khadho la rather than khade la. My answer was yes. That gives me two approved phrases for ‘for the food’, but it does not explain why the noun has two recorded shapes. I have seen similar questions with chokro/chokre and ghar/ghare(n); these could be related to case or usage, though I have not demonstrated that."
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
            "text": "I accept both khadho la and khade la. I cannot therefore say that la obligatorily turns khadho into khade. Whether the forms differ in emphasis, register, or preferred context remains an open question."
          }
        ]
      },
      {
        "id": "beneficiary-recipient",
        "title": "A beneficiary is not necessarily a recipient or owner",
        "blocks": [
          {
            "type": "text",
            "text": "My earlier example Au(n) hikro maru ke khadho dhinose puts ke after the man who receives the food. In Hin la au(n) pe(n)sa kayose, la describes someone for whom I act. In Hin jo pe(n)sa au(n) kayose, jo links an owner to money. Those roles overlap in everyday stories, but they are not the same grammatical relationship."
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
            "text": "For Madhaaf, I want dictionary entries to capture these relationships without replacing them with one-word English equivalents. The sentence a form occurs in is as important as its shortest gloss."
          }
        ]
      },
      {
        "id": "la-jo-next-tests",
        "title": "The questions I want to answer next",
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
            "label": "My working conclusion",
            "text": "The clearest contrast in my current material is la for a beneficiary and jo for possession. That is a defensible description of these examples, not a finished dictionary of all uses of either word."
          }
        ]
      }
    ]
  },
  {
    "slug": "how-negation-works-in-my-kutchi",
    "editorialDate": "2026-10-21",
    "number": "07",
    "subject": "Negation and verb agreement",
    "title": "Not just one way to say no: How negation works in my Kutchi",
    "summary": "From natho and nathi to nai, na and nah, my recorded sentences suggest that negation interacts with gender, tense, commands, and even wanting.",
    "introduction": "For a long time I could translate sentences such as ‘he isn't sleeping’ or ‘I didn't get permission’ without wondering why I used a different negative form each time. Once I started writing down my Kutchi, the contrast became impossible to ignore. I have recorded natho, nathi, nathaa, na, nah and nai, but they are not simply interchangeable ways of saying English ‘not’. In this article I want to show where I actually use them, which comparisons are strongest, and where the grammar is still unclear.",
    "illustration": "/language/research/negation-patterns.svg",
    "illustrationAlt": "Original abstract editorial illustration of alternating light and dark circular forms connected by six paths, suggesting contrasting grammatical negative constructions.",
    "wordNotes": [
      {
        "word": "natho",
        "meaning": "Negative element in recorded present clauses, including masculine-subject examples."
      },
      {
        "word": "nathi",
        "meaning": "Negative element in recorded feminine-subject present clauses."
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
        "meaning": "Negative element recorded with a past giving verb and in ‘there is no food’; not exclusively past or existential."
      },
      {
        "word": "sum",
        "meaning": "Sleep; compare sume in the present negatives."
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
        "title": "Natho and nathi: the first contrast I noticed",
        "blocks": [
          {
            "type": "text",
            "text": "I can put two sentences about sleeping side by side and change the negative without changing the word sume. These examples give me some of the clearest evidence that the negative construction can distinguish gender. They do not yet tell me whether natho and nathi form a complete auxiliary paradigm."
          },
          {
            "type": "examples",
            "label": "Present negatives with the same lexical verb",
            "items": [
              {
                "kutchi": "Natho sume",
                "english": "He is not sleeping.",
                "context": "Masculine-subject reading"
              },
              {
                "kutchi": "Nathi sume",
                "english": "She is not sleeping.",
                "context": "Feminine-subject reading"
              }
            ]
          },
          {
            "type": "text",
            "text": "What changes here is natho versus nathi; sume stays the same. That makes it plausible that some agreement is expressed by the negative element rather than by the ordinary lexical verb. I still want to test the same contrast across people, verbs and numbers."
          },
          {
            "type": "finding",
            "strength": "hypothesis",
            "label": "Agreement on the negative element",
            "text": "These two sentences support gender-sensitive negative forms in their recorded contexts. I cannot yet conclude how to segment the endings, or that every negative verb construction works this way."
          }
        ]
      },
      {
        "id": "giving-time",
        "title": "Not giving money: a particularly useful present/past pair",
        "blocks": [
          {
            "type": "text",
            "text": "The next comparison is valuable because I kept the subject, the recipient and the money the same. I changed the intended time reference from ‘doesn't give’ to ‘didn't give’. Both the negative element and the giving form changed."
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
                "english": "He didn't give me money.",
                "context": "Past negative"
              }
            ]
          },
          {
            "type": "table",
            "headers": [
              "Element",
              "Present negative",
              "Past negative"
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
            "caption": "Two forms change together. The contrast does not by itself establish that swapping only the negative word would produce a grammatical tense change."
          },
          {
            "type": "text",
            "text": "Because both natho → nai and dye → dhine change, I cannot say the negative alone marks the past. These are two attested constructions. The forms belong with the verb de (‘give’), but I will not invent a complete negative conjugation from this one pair."
          }
        ]
      },
      {
        "id": "female-elicitation",
        "title": "Why I am not assigning every role in the feminine examples yet",
        "blocks": [
          {
            "type": "text",
            "text": "I was also asked for present and past negative giving sentences with a female giver. I gave the following forms. They are useful evidence for the negative words and giving morphology, but I need to check who is giving and receiving the money before I label the agreement conclusively. Both hin ke and au(n) occur in the sentences, and my other notes give those expressions different grammatical functions in other contexts."
          },
          {
            "type": "examples",
            "label": "Exact forms from feminine-subject elicitation — not independent English translations",
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
            "text": "I know which tense I intended in these answers. I have not explicitly confirmed in these precise sentences who gives and who receives the money. Until I do, I cannot claim that dhineese or dhya(n) has a particular feminine suffix or that hin ke is the subject."
          }
        ]
      },
      {
        "id": "negative-commands-and-future",
        "title": "Nah with commands—and with future meaning",
        "blocks": [
          {
            "type": "text",
            "text": "Some of my clearest prohibitions use nah before the command form. But I have also supplied nah with a future-tense form. That makes it important not to describe nah as exclusively an imperative marker."
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
            "text": "The recorded command examples have nah before sum, vin and kar. The earlier future example Nah vendhose shows another environment. I still need plural, polite and other future negative forms before claiming a complete rule."
          }
        ]
      },
      {
        "id": "na-and-nai",
        "title": "Why nai cannot mean only ‘past’ or only ‘there is no’",
        "blocks": [
          {
            "type": "text",
            "text": "My past negative ‘we did not go’ uses na. My sentence about there being no food uses nai without a past verb. And my money examples use nai with a giving form in the past. I should not give each negative one English definition and pretend it covers every construction."
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
            "text": "In that last sentence, I used natho in the main clause and nai dhine in the explanation involving my father. It strengthens the distinction between constructions, but it does not yet tell me whether nai is an independent negative, a special auxiliary form, or part of a larger phrase with dhine."
          },
          {
            "type": "finding",
            "strength": "unresolved",
            "label": "Two easy conclusions I want to avoid",
            "text": "Nai is attested in past giving and in ‘there is no food’; it is therefore not supported as exclusively a past marker or exclusively an existential negative. Na occurs in a past negative, but I have not tested enough examples to limit its use to the past."
          }
        ]
      },
      {
        "id": "not-wanting",
        "title": "When the thing I want is negated",
        "blocks": [
          {
            "type": "text",
            "text": "Negation also matters in the sentences where someone wants something. I have recorded the singular desired item paani (‘water’) with natho, and several desired things with nathaa. That raises a further question about agreement: what grammatical relationship controls the negative form when the person wanting is expressed with mukhe or hin ke?"
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
            "text": "The negative example with plural cheejeu(n) has nathaa, but I still need feminine desired items and other plural clauses to find out whether the negative agrees with what is wanted, who wants it, or another grammatical feature. The water negative puts paani before the experiencer, whereas the affirmative example puts mukhe first. I have not held all other factors constant, so I cannot say negation itself requires that change in word order."
          }
        ]
      },
      {
        "id": "negative-inventory",
        "title": "Six forms in my notebook, not one finished paradigm",
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
                "Masculine present sleeping; present giving; negative desire",
                "Full agreement system and distribution"
              ],
              [
                "nathi",
                "Feminine present sleeping; feminine-context giving example",
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
                "There is no food; past giving; permission denied",
                "Whether one or several constructions are involved"
              ]
            ],
            "caption": "Each row is grounded in an attested form. This is a distributional inventory, not a predictive conjugation table."
          },
          {
            "type": "text",
            "text": "I want this article to help anyone reading Madhaaf understand why I am saving full sentences, not just a dictionary entry for ‘not’. A sentence lets me see which negative form occurs with which verb, subject, time reference and kind of meaning. The rules are only as reliable as the comparisons that support them."
          },
          {
            "type": "questions",
            "items": [
              "In Hin ke au(n) pe(n)sa nai dhineese, exactly who is giving the money, and who is receiving it?",
              "How does a plural person, rather than a plural desired object, affect natho/nathi/nathaa?",
              "Does nai combine with verbs other than de in the past, and in what order?",
              "Can I change the order of a negative sentence without changing the meaning or emphasis?",
              "How do I negate future clauses with feminine and plural subjects?"
            ]
          },
          {
            "type": "finding",
            "strength": "hypothesis",
            "label": "My working conclusion",
            "text": "Kutchi negation is sensitive to grammatical context: the negative element and the shape of the verb can both vary. I have not yet demonstrated a single underlying rule that predicts every negative sentence."
          }
        ]
      }
    ]
  }
];
