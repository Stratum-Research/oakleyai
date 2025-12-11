import { Question } from '@/types';

export const DEMO_QUESTIONS: Question[] = [
  {
    question_id: 1,
    created_at: new Date().toISOString(),
    question_text: "A researcher is studying the structure of a protein and observes that it has multiple polypeptide chains that are held together by disulfide bonds and hydrogen bonds. What level of protein structure is being described?",
    answer_choices: [
      "Primary structure",
      "Secondary structure",
      "Tertiary structure",
      "Quaternary structure"
    ],
    correct_answer: 3, // Index of "Quaternary structure"
    explanation: "Quaternary structure refers to the arrangement of multiple polypeptide chains (subunits) in a multi-subunit protein. These subunits are held together by various interactions including disulfide bonds, hydrogen bonds, ionic interactions, and hydrophobic interactions. Primary structure is the amino acid sequence, secondary structure refers to alpha helices and beta sheets, and tertiary structure is the 3D folding of a single polypeptide chain.",
    concept_tags: ["Protein Structure", "Quaternary Structure", "Biochemistry"],
    subject: "Biochemistry",
    subject_subtopic: "Protein Structure and Function"
  },
  {
    question_id: 2,
    created_at: new Date().toISOString(),
    question_text: "An enzyme has a Km value of 2 mM for its substrate. Which of the following statements best describes the meaning of this Km value?",
    answer_choices: [
      "The substrate concentration at which the enzyme is working at maximum velocity",
      "The substrate concentration at which the enzyme is working at half of its maximum velocity",
      "The rate of the reaction when substrate concentration is saturating",
      "The number of substrate molecules converted to product per enzyme molecule per second"
    ],
    correct_answer: 1, // Index of second choice
    explanation: "The Michaelis constant (Km) is defined as the substrate concentration at which the reaction velocity is half of the maximum velocity (Vmax/2). It is an inverse measure of the enzyme's affinity for its substrate - a lower Km indicates higher affinity. The maximum velocity occurs at saturating substrate concentrations, and the turnover number (kcat) describes the number of substrate molecules converted per enzyme per second.",
    concept_tags: ["Enzyme Kinetics", "Km", "Michaelis-Menten"],
    subject: "Biochemistry",
    subject_subtopic: "Enzyme Kinetics"
  },
  {
    question_id: 3,
    created_at: new Date().toISOString(),
    question_text: "During protein synthesis, a newly formed polypeptide chain is translocated into the endoplasmic reticulum (ER) lumen. Which of the following sequences would most likely be found at the N-terminus of this protein?",
    answer_choices: [
      "A sequence rich in charged amino acids (lysine and glutamate)",
      "A sequence rich in hydrophobic amino acids (leucine and isoleucine)",
      "A sequence rich in polar amino acids (serine and threonine)",
      "A sequence rich in aromatic amino acids (tryptophan and tyrosine)"
    ],
    correct_answer: 1, // Index of second choice
    explanation: "Proteins destined for the ER contain a signal sequence at their N-terminus, which is typically 15-30 amino acids long and enriched in hydrophobic residues such as leucine, isoleucine, valine, and phenylalanine. This hydrophobic signal sequence is recognized by the signal recognition particle (SRP), which directs the ribosome-mRNA-polypeptide complex to the ER membrane for co-translational translocation. The signal sequence is usually cleaved off by signal peptidase once the protein enters the ER lumen.",
    concept_tags: ["Protein Trafficking", "Signal Sequence", "ER Translocation"],
    subject: "Biochemistry",
    subject_subtopic: "Protein Synthesis and Trafficking"
  }
];

