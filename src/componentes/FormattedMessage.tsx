import React from "react";
import { StyleSheet, Text, View } from "react-native";

type FormattedMessageProps = {
  text: string;
};

export const FormattedMessage = ({ text }: FormattedMessageProps) => {
  if (!text) return null;

  const lines = text
    .replace(/^#+\s?/gm, "") // remove títulos markdown tipo ##
    .replace(/^-{3,}$/gm, "") // remove linhas de ---
    .replace(/:?-{3,}:?/gm, "") // remove linhas tipo :-----:
    .split("\n");

  const renderFormattedLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <View key={index} style={styles.emptyLine} />;

    // Tipos de linha
    const isBullet = /^[*•\-]\s/.test(trimmed);
    const isNumbered = /^\d+\.\s/.test(trimmed);
    const isTitle =
      /:\s*$/.test(trimmed) ||
      (trimmed.startsWith("**") && trimmed.endsWith("**"));
    const isQuote = trimmed.startsWith(">");
    const isHeader = /^#+\s/.test(trimmed) || /Dia [A-Z]:/i.test(trimmed);
    const isTableRow =
      /\|/.test(trimmed) &&
      trimmed.split("|").filter((p) => p.trim().length > 0).length > 1 &&
      !/^[:\-|]+$/.test(trimmed);

    // Remove símbolos markdown
    let content = trimmed
      .replace(/^#+\s?/, "")
      .replace(/^[*•\-]\s/, "")
      .replace(/^\d+\.\s/, "")
      .replace(/^>\s?/, "")
      .replace(/[*_]{3,}/g, "")
      .replace(/:?-{3,}:?/g, "")
      .trim();

    // Se for linha de tabela
    if (isTableRow) {
      const rawColumns = content
        .split("|")
        .map((col) => col.trim())
        .filter((col) => col.length > 0);

      if (rawColumns.length === 0) return null;

      return (
        <View
          key={index}
          style={[
            styles.tableRow,
            index % 2 === 0 && styles.tableRowAlt,
          ]}
        >
          {rawColumns.map((col, colIndex) => (
            <View
              key={`${index}-${colIndex}`}
              style={[
                styles.tableCell,
                colIndex === 0 && { flex: 2.6 }, // AUMENTADO um pouco (Exercício)
                colIndex === 1 && { flex: 0.9 }, // Séries - igual
                colIndex === 2 && { flex: 1.6 }, // Repetições - igual
                colIndex === 3 && { flex: 2.8 }, // Dica - DIMINUÍDO um pouco
              ]}
            >
              <Text style={styles.tableText}>{col}</Text>
            </View>
          ))}
        </View>
      );
    }

    // Cabeçalho verde
    if (isHeader) {
      return (
        <View key={index} style={styles.headerContainer}>
          <Text style={styles.headerText}>💪 {content}</Text>
        </View>
      );
    }

    // Citação
    if (isQuote) {
      return (
        <View key={index} style={styles.quoteContainer}>
          <View style={styles.quoteBar} />
          <Text style={styles.quoteText}>{content}</Text>
        </View>
      );
    }

    // Lista
    if (isBullet || isNumbered) {
      const prefix = isNumbered ? `${trimmed.match(/^\d+/)?.[0]}.` : "•";
      return (
        <View key={index} style={styles.listItem}>
          <Text style={styles.bullet}>{prefix}</Text>
          <Text style={styles.listText}>{formatInlineStyles(content)}</Text>
        </View>
      );
    }

    // Título (com caixa alta)
    if (isTitle) {
      return (
        <Text key={index} style={styles.titleText}>
          {content
            .replace(/\*\*/g, "")
            .toUpperCase()}
        </Text>
      );
    }

    // Texto normal
    return (
      <Text key={index} style={styles.text}>
        {formatInlineStyles(content)}
      </Text>
    );
  };

  // Aplica negrito e itálico inline
  const formatInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={i} style={styles.bold}>
            {part.replace(/\*\*/g, "").toUpperCase()}
          </Text>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <Text key={i} style={styles.italic}>
            {part.replace(/\*/g, "")}
          </Text>
        );
      }
      return part;
    });
  };

  return <View style={styles.container}>{lines.map(renderFormattedLine)}</View>;
};

// ---------------------------
// 🎨 Estilos
// ---------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 4,
  },
  emptyLine: {
    height: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1C1C1C",
  },
  bold: {
    fontWeight: "700",
    color: "#1B5E20",
  },
  italic: {
    fontStyle: "italic",
    color: "#444",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginVertical: 6,
  },
  headerContainer: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    marginLeft: 8,
  },
  bullet: {
    color: "#2E7D32",
    fontWeight: "700",
    marginRight: 6,
    fontSize: 16,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#1C1C1C",
  },
  quoteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F0F0",
    borderLeftWidth: 4,
    borderLeftColor: "#81C784",
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
  },
  quoteBar: {
    width: 3,
    backgroundColor: "#81C784",
    marginRight: 10,
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    color: "#444",
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 20,
  },
  // 🧩 Estilo das tabelas
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    marginVertical: 2,
    overflow: "hidden",
  },
  tableRowAlt: {
    backgroundColor: "#F5F5F5",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  tableText: {
    fontSize: 14,
    color: "#1C1C1C",
  },
});
