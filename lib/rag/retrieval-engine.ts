// ═══════════════════════════════════════════════════════════════════
// ML-Enhanced Retrieval Engine — BM25 + TF-IDF + 语义嵌入混合检索
// 算法: Okapi BM25 (Robertson et al.), TF-IDF cosine, Embedding cosine
// ═══════════════════════════════════════════════════════════════════

export interface RAGDocument {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  source?: string;       // "builtin" | "ingested" | "expanded"
  embedding?: number[];  // 语义向量 (由 Embedding API 生成)
}

export interface RetrievalResult {
  doc: RAGDocument;
  score: number;
  bm25Score: number;
  tfidfScore: number;
  embeddingScore: number;
  matchedTerms: string[];
}

// ── BM25 参数 ─────────────────────────────────────────────────────
const BM25_K1 = 1.5;   // 词频饱和参数 (1.2-2.0)
const BM25_B = 0.75;   // 文档长度归一化 (0-1)
const BM25_WEIGHT = 0.45;
const TFIDF_WEIGHT = 0.35;
const EMBEDDING_WEIGHT = 0.20;

// ── 中文分词 (改进版: 支持 unigram + bigram + trigram) ─────────────
export function tokenize(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, " ");
  const tokens: string[] = [];

  // 中文: unigram + bigram + trigram
  const chinese = cleaned.replace(/[a-z0-9\s]/g, "");
  for (let i = 0; i < chinese.length; i++) {
    tokens.push(chinese[i]);
    if (i < chinese.length - 1) tokens.push(chinese.substring(i, i + 2));
    if (i < chinese.length - 2) tokens.push(chinese.substring(i, i + 3));
  }

  // 英文: 单词
  const english = cleaned.replace(/[\u4e00-\u9fa5]/g, " ").split(/\s+/).filter(Boolean);
  tokens.push(...english);

  return tokens;
}

// ── 停用词表 ──────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都",
  "一", "一个", "上", "也", "很", "到", "说", "要", "去", "你",
  "会", "着", "没有", "看", "好", "自己", "这", "他", "她", "它",
  "们", "那", "些", "么", "什么", "怎么", "吗", "吧", "呢", "哪",
  "the", "a", "an", "is", "are", "was", "were", "be", "been",
  "have", "has", "had", "do", "does", "did", "will", "would",
  "can", "could", "shall", "should", "may", "might", "must",
  "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "into", "about", "like",
  "this", "that", "it", "its", "my", "your", "his", "her",
]);

function removeStopWords(tokens: string[]): string[] {
  return tokens.filter((t) => !STOP_WORDS.has(t) && t.length > 0);
}

// ── 词频统计 ──────────────────────────────────────────────────────
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }
  return tf;
}

// ═══════════════════════════════════════════════════════════════════
// BM25 Index — 构建倒排索引 + IDF预计算
// ═══════════════════════════════════════════════════════════════════
export class BM25Index {
  private docs: RAGDocument[] = [];
  private docTokens: Map<string, string[]> = new Map();      // docId → tokens
  private docTF: Map<string, Map<string, number>> = new Map(); // docId → (term→freq)
  private docLengths: Map<string, number> = new Map();         // docId → length
  private avgDL = 0;
  private idf: Map<string, number> = new Map();                // term → IDF
  private invertedIndex: Map<string, Set<string>> = new Map(); // term → Set<docId>
  private N = 0;

  constructor(documents: RAGDocument[]) {
    this.buildIndex(documents);
  }

  private buildIndex(documents: RAGDocument[]) {
    this.docs = documents;
    this.N = documents.length;
    let totalLen = 0;

    // Phase 1: 分词 + 词频
    for (const doc of documents) {
      const text = `${doc.title} ${doc.title} ${doc.tags.join(" ")} ${doc.content}`;
      const tokens = removeStopWords(tokenize(text));
      this.docTokens.set(doc.id, tokens);
      this.docTF.set(doc.id, termFrequency(tokens));
      this.docLengths.set(doc.id, tokens.length);
      totalLen += tokens.length;

      // 倒排索引
      const uniqueTerms = new Set(tokens);
      for (const term of uniqueTerms) {
        if (!this.invertedIndex.has(term)) {
          this.invertedIndex.set(term, new Set());
        }
        this.invertedIndex.get(term)!.add(doc.id);
      }
    }
    this.avgDL = totalLen / Math.max(this.N, 1);

    // Phase 2: IDF预计算 (Robertson-Spärck Jones IDF)
    for (const [term, docSet] of this.invertedIndex) {
      const df = docSet.size;
      // IDF = log((N - df + 0.5) / (df + 0.5) + 1)
      this.idf.set(term, Math.log((this.N - df + 0.5) / (df + 0.5) + 1));
    }
  }

  /**
   * BM25 检索 — Okapi BM25 评分
   */
  searchBM25(query: string, topK: number = 5): { docId: string; score: number; matchedTerms: string[] }[] {
    const queryTokens = removeStopWords(tokenize(query));
    if (queryTokens.length === 0) return [];

    const scores: { docId: string; score: number; matchedTerms: string[] }[] = [];

    for (const doc of this.docs) {
      const tf = this.docTF.get(doc.id)!;
      const dl = this.docLengths.get(doc.id)!;
      let score = 0;
      const matchedTerms: string[] = [];

      for (const qt of queryTokens) {
        const termFreq = tf.get(qt) || 0;
        if (termFreq === 0) continue;

        const idfVal = this.idf.get(qt) || 0;
        // BM25 = IDF × (tf × (k1+1)) / (tf + k1 × (1 - b + b × dl/avgDL))
        const numerator = termFreq * (BM25_K1 + 1);
        const denominator = termFreq + BM25_K1 * (1 - BM25_B + BM25_B * dl / this.avgDL);
        score += idfVal * (numerator / denominator);
        matchedTerms.push(qt);
      }

      if (score > 0) {
        scores.push({ docId: doc.id, score, matchedTerms: [...new Set(matchedTerms)] });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }

  /**
   * TF-IDF 余弦相似度检索
   */
  searchTFIDF(query: string, topK: number = 5): { docId: string; score: number }[] {
    const queryTokens = removeStopWords(tokenize(query));
    if (queryTokens.length === 0) return [];

    // 查询向量 TF-IDF
    const queryTF = termFrequency(queryTokens);
    const queryVec = new Map<string, number>();
    for (const [term, freq] of queryTF) {
      const idfVal = this.idf.get(term) || 0;
      queryVec.set(term, (freq / queryTokens.length) * idfVal);
    }

    const scores: { docId: string; score: number }[] = [];

    for (const doc of this.docs) {
      const tf = this.docTF.get(doc.id)!;
      const dl = this.docLengths.get(doc.id)!;

      // 文档向量 TF-IDF
      let dotProduct = 0;
      let docNorm = 0;

      for (const [term, freq] of tf) {
        const idfVal = this.idf.get(term) || 0;
        const tfidf = (freq / dl) * idfVal;
        if (queryVec.has(term)) {
          dotProduct += tfidf * queryVec.get(term)!;
        }
        docNorm += tfidf * tfidf;
      }

      let queryNorm = 0;
      for (const v of queryVec.values()) {
        queryNorm += v * v;
      }

      const cosine = dotProduct / (Math.sqrt(docNorm) * Math.sqrt(queryNorm) + 1e-10);
      if (cosine > 0) {
        scores.push({ docId: doc.id, score: cosine });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }

  getDocument(docId: string): RAGDocument | undefined {
    return this.docs.find((d) => d.id === docId);
  }

  getAllDocuments(): RAGDocument[] {
    return this.docs;
  }

  getDocCount(): number {
    return this.N;
  }

  getVocabSize(): number {
    return this.invertedIndex.size;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Embedding Search — 语义嵌入余弦相似度
// ═══════════════════════════════════════════════════════════════════

/**
 * 余弦相似度 (用于向量比较)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

/**
 * 通过 LLM API 获取文本嵌入向量
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const embeddingModel = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

  if (!apiKey) return null;

  try {
    const res = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: embeddingModel,
        input: text.slice(0, 8000), // 截断到8000字符
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
}

/**
 * 基于嵌入向量的语义搜索
 */
export function searchByEmbedding(
  queryEmbedding: number[],
  docs: RAGDocument[],
  topK: number = 5
): { docId: string; score: number }[] {
  const scores: { docId: string; score: number }[] = [];

  for (const doc of docs) {
    if (!doc.embedding || doc.embedding.length === 0) continue;
    const sim = cosineSimilarity(queryEmbedding, doc.embedding);
    if (sim > 0) {
      scores.push({ docId: doc.id, score: sim });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}

// ═══════════════════════════════════════════════════════════════════
// Hybrid Retrieval — BM25 + TF-IDF + Embedding 混合检索
// ═══════════════════════════════════════════════════════════════════

export class HybridRetriever {
  private bm25Index: BM25Index;
  private docs: RAGDocument[];
  private weights: { bm25: number; tfidf: number; embedding: number };

  constructor(
    documents: RAGDocument[],
    weights?: { bm25: number; tfidf: number; embedding: number }
  ) {
    this.docs = documents;
    this.bm25Index = new BM25Index(documents);
    this.weights = weights || {
      bm25: BM25_WEIGHT,
      tfidf: TFIDF_WEIGHT,
      embedding: EMBEDDING_WEIGHT,
    };
  }

  /**
   * 混合检索 (BM25 + TF-IDF + 可选Embedding)
   */
  async search(
    query: string,
    topK: number = 5,
    useEmbedding: boolean = false
  ): Promise<RetrievalResult[]> {
    // BM25 检索
    const bm25Results = this.bm25Index.searchBM25(query, topK * 2);
    // TF-IDF 检索
    const tfidfResults = this.bm25Index.searchTFIDF(query, topK * 2);

    // 归一化分数
    const maxBM25 = Math.max(...bm25Results.map((r) => r.score), 1e-10);
    const maxTFIDF = Math.max(...tfidfResults.map((r) => r.score), 1e-10);

    // 合并分数
    const scoreMap = new Map<string, {
      bm25: number; tfidf: number; embedding: number; matchedTerms: string[];
    }>();

    for (const r of bm25Results) {
      const entry = scoreMap.get(r.docId) || { bm25: 0, tfidf: 0, embedding: 0, matchedTerms: [] };
      entry.bm25 = r.score / maxBM25;
      entry.matchedTerms = r.matchedTerms;
      scoreMap.set(r.docId, entry);
    }

    for (const r of tfidfResults) {
      const entry = scoreMap.get(r.docId) || { bm25: 0, tfidf: 0, embedding: 0, matchedTerms: [] };
      entry.tfidf = r.score / maxTFIDF;
      scoreMap.set(r.docId, entry);
    }

    // Embedding 检索 (可选)
    if (useEmbedding) {
      const queryEmb = await getEmbedding(query);
      if (queryEmb) {
        const embResults = searchByEmbedding(queryEmb, this.docs, topK * 2);
        const maxEmb = Math.max(...embResults.map((r) => r.score), 1e-10);
        for (const r of embResults) {
          const entry = scoreMap.get(r.docId) || { bm25: 0, tfidf: 0, embedding: 0, matchedTerms: [] };
          entry.embedding = r.score / maxEmb;
          scoreMap.set(r.docId, entry);
        }
      }
    }

    // 加权融合
    const results: RetrievalResult[] = [];
    for (const [docId, scores] of scoreMap) {
      const doc = this.bm25Index.getDocument(docId);
      if (!doc) continue;

      const finalScore =
        scores.bm25 * this.weights.bm25 +
        scores.tfidf * this.weights.tfidf +
        scores.embedding * this.weights.embedding;

      results.push({
        doc,
        score: finalScore,
        bm25Score: scores.bm25,
        tfidfScore: scores.tfidf,
        embeddingScore: scores.embedding,
        matchedTerms: scores.matchedTerms,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * 同步检索 (仅BM25 + TF-IDF, 无需await)
   */
  searchSync(query: string, topK: number = 5): RetrievalResult[] {
    const bm25Results = this.bm25Index.searchBM25(query, topK * 2);
    const tfidfResults = this.bm25Index.searchTFIDF(query, topK * 2);

    const maxBM25 = Math.max(...bm25Results.map((r) => r.score), 1e-10);
    const maxTFIDF = Math.max(...tfidfResults.map((r) => r.score), 1e-10);

    const scoreMap = new Map<string, {
      bm25: number; tfidf: number; matchedTerms: string[];
    }>();

    for (const r of bm25Results) {
      const entry = scoreMap.get(r.docId) || { bm25: 0, tfidf: 0, matchedTerms: [] };
      entry.bm25 = r.score / maxBM25;
      entry.matchedTerms = r.matchedTerms;
      scoreMap.set(r.docId, entry);
    }

    for (const r of tfidfResults) {
      const entry = scoreMap.get(r.docId) || { bm25: 0, tfidf: 0, matchedTerms: [] };
      entry.tfidf = r.score / maxTFIDF;
      scoreMap.set(r.docId, entry);
    }

    const adjustedBM25 = this.weights.bm25 / (this.weights.bm25 + this.weights.tfidf);
    const adjustedTFIDF = this.weights.tfidf / (this.weights.bm25 + this.weights.tfidf);

    const results: RetrievalResult[] = [];
    for (const [docId, scores] of scoreMap) {
      const doc = this.bm25Index.getDocument(docId);
      if (!doc) continue;

      results.push({
        doc,
        score: scores.bm25 * adjustedBM25 + scores.tfidf * adjustedTFIDF,
        bm25Score: scores.bm25,
        tfidfScore: scores.tfidf,
        embeddingScore: 0,
        matchedTerms: scores.matchedTerms,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  getStats() {
    return {
      docCount: this.bm25Index.getDocCount(),
      vocabSize: this.bm25Index.getVocabSize(),
      weights: this.weights,
    };
  }
}
