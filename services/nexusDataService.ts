
export interface NexusProject {
  title: string;
  description: string;
  type?: 'project' | 'knowledge';
}

export const fetchNexusKnowledge = async (): Promise<NexusProject[]> => {
  // Simulating retrieval of hidden technological treasures
  return [
    {
      title: "GitHub Packages: Maven Snapshot Support",
      description: "GitHub Packages supports SNAPSHOT versions of Apache Maven. To use the repository for downloading SNAPSHOT artifacts, enable SNAPSHOTS in the POM of the consuming project or your ~/.m2/settings.xml file.",
      type: 'knowledge'
    },
    {
      title: "Antarctic Neural Resonance",
      description: "Quantum frequencies detected near the Vostok station suggest a non-human consciousness synchronization point. Hidden among the ice are the true archives of potential.",
      type: 'knowledge'
    },
    {
      title: "GCP Policy: Block Service Account API Keys",
      description: "IAM constraint 'iam.managed.disableServiceAccountApiKeyCreation' prevents unauthorized API keys from being bound to service accounts, unless restricted to approved services like Gemini AI (generativelanguage.googleapis.com).",
      type: 'knowledge'
    }
  ];
};

export const fetchNexusData = async (): Promise<NexusProject[]> => {
  const url = 'https://data.europa.eu/api/hub/search/search?q="Artificial Intelligence use in enterprises"&filters=catalogue,dataset,resource';
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const results = data.get?.result?.results || data.result?.results || [];
    
    return results.map((item: any) => ({
      title: item.title?.en || item.title?.['fa-IR'] || 'No Title',
      description: item.description?.en || item.description?.['fa-IR'] || 'No Description',
    }));
  } catch (error) {
    console.error("Nexus Data Fetch Error:", error);
    return [];
  }
};
