import {faqData} from "../data/faq.data";


export function searchFaq(query: string): string | null {
    query = query.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const item of faqData) {
        const score = similarity(query, item.question.toLowerCase());
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item.answer;
        }
    }

    return bestScore > 0.3 ? bestMatch : null;
}

function similarity(a: string, b: string): number {
    const common = a.split(" ").filter(word => b.includes(word)).length;
    return common / Math.max(a.split(" ").length, b.split(" ").length);
}
