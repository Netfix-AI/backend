import { geminiService } from './geminiService.js';
import { supabaseService } from './supabaseService.js';
import type { LegalKnowledgeDocEntity, UserRole } from '../types/index.js';

export interface RankedKnowledgeDoc extends LegalKnowledgeDocEntity {
  similarityScore: number;
}

export interface RagSearchOptions {
  topK?: number;
  category?: string;
  userRole?: UserRole;
}

export class RagService {
  /**
   * Generates and stores embedding vectors for all documents in legal_knowledge_docs corpus
   */
  public async indexKnowledgeBase(): Promise<number> {
    const docs = await supabaseService.searchKnowledgeDocs('', 'all');
    let count = 0;

    for (const doc of docs) {
      if (!doc.embedding_vector) {
        const textToEmbed = `${doc.title}\n${doc.source_text}`;
        const vector = await geminiService.generateEmbedding(textToEmbed);
        doc.embedding_vector = JSON.stringify(vector);
        count++;
      }
    }

    return count;
  }

  /**
   * Searches knowledge corpus using Gemini RAG embedding cosine similarity ranking + RBAC scoping
   */
  public async searchSimilarDocs(
    query: string,
    options: RagSearchOptions = {}
  ): Promise<RankedKnowledgeDoc[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    const { topK = 3, category, userRole } = options;

    // Fetch candidate documents
    let candidateDocs = await supabaseService.searchKnowledgeDocs('', category || 'all', userRole);

    // Security / RBAC scoping: Filter restricted docs for client/tenant roles
    if (userRole === 'client' || userRole === 'tenant') {
      candidateDocs = candidateDocs.filter(d => {
        if (d.is_restricted) return false;
        if (d.allowed_roles && Array.isArray(d.allowed_roles)) {
          return d.allowed_roles.includes(userRole);
        }
        return true;
      });
    }

    if (candidateDocs.length === 0) {
      return [];
    }

    // Generate embedding vector for query
    const queryVector = await geminiService.generateEmbedding(query);

    const scoredDocs: RankedKnowledgeDoc[] = [];

    for (const doc of candidateDocs) {
      let docVector: number[] = [];

      if (doc.embedding_vector) {
        try {
          docVector = JSON.parse(doc.embedding_vector);
        } catch {
          docVector = [];
        }
      }

      if (!docVector || docVector.length === 0) {
        // Generate on the fly if missing
        docVector = await geminiService.generateEmbedding(`${doc.title}\n${doc.source_text}`);
        doc.embedding_vector = JSON.stringify(docVector);
      }

      const score = geminiService.computeCosineSimilarity(queryVector, docVector);
      scoredDocs.push({
        ...doc,
        similarityScore: Number(score.toFixed(4)),
      });
    }

    // Sort descending by similarity score
    scoredDocs.sort((a, b) => b.similarityScore - a.similarityScore);

    return scoredDocs.slice(0, topK);
  }
}

export const ragService = new RagService();
