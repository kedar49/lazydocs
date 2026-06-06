/**
 * Smartly merges newly generated documentation content into existing documentation content
 * by replacing content between comment anchors.
 * 
 * Anchors are in the format:
 * <!-- lazydocs:start:<section> -->
 * <!-- lazydocs:end:<section> -->
 * 
 * If the existing content contains no matching anchors, the function returns the new content completely
 * (falling back to a full overwrite).
 */
export function mergeContent(existingContent: string, newContent: string): string {
  // Regex to find all start blocks in the new content
  const startRegex = /<!-- lazydocs:start:([\w-]+) -->/g;
  let match;
  let mergedContent = existingContent;

  const sections: { [key: string]: string } = {};

  // Find all sections in the new generated content
  while ((match = startRegex.exec(newContent)) !== null) {
    const sectionName = match[1];
    const startTag = `<!-- lazydocs:start:${sectionName} -->`;
    const endTag = `<!-- lazydocs:end:${sectionName} -->`;
    
    const startIndex = newContent.indexOf(startTag);
    const endIndex = newContent.indexOf(endTag);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      // Extract the content inside the tags
      const newSectionContent = newContent.substring(startIndex + startTag.length, endIndex);
      sections[sectionName] = newSectionContent;
    }
  }

  // If the existing content doesn't contain any of the lazydocs start tags,
  // return the new content completely (overwrite)
  let hasAnyAnchor = false;
  for (const sectionName of Object.keys(sections)) {
    const startTag = `<!-- lazydocs:start:${sectionName} -->`;
    if (existingContent.includes(startTag)) {
      hasAnyAnchor = true;
      break;
    }
  }

  if (!hasAnyAnchor) {
    return newContent;
  }

  // Replace only the matched sections in the existing content
  for (const [sectionName, newSectionContent] of Object.entries(sections)) {
    const startTag = `<!-- lazydocs:start:${sectionName} -->`;
    const endTag = `<!-- lazydocs:end:${sectionName} -->`;
    
    const startIndex = mergedContent.indexOf(startTag);
    const endIndex = mergedContent.indexOf(endTag);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const before = mergedContent.substring(0, startIndex + startTag.length);
      const after = mergedContent.substring(endIndex);
      mergedContent = before + newSectionContent + after;
    }
  }

  return mergedContent;
}
