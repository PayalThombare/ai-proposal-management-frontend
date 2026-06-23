import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getRFPById } from "../services/rfpService";
import { createProposal,  getProposalByRfpId, downloadProposalPdf} from "../services/proposalService";


// ------------------------------
// Reusable Toast Component
// ------------------------------
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-500 text-green-800"
      : "bg-red-50 border-red-500 text-red-800";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg border-l-4 transition-all ${bgColor}`}
      role="alert"
    >
      <span className="text-lg font-bold">{type === "success" ? "✓" : "✕"}</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

// ------------------------------
// Collapsible Section Component
// ------------------------------
const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && <div className="px-6 pb-6 pt-0 space-y-4">{children}</div>}
    </div>
  );
};

// ------------------------------
// Utility: safely convert any value to a displayable string
// ------------------------------
const safeRenderValue = (value) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string" || typeof value === "number") return String(value);
  // If it's an object, convert to a readable string (compact)
  try {
    // For development effort-like objects, show key-value pairs
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  } catch {
    return String(value);
  }
};


// const handleDownload = async () => {
  
//   try {
//     const response = await downloadProposalPdf(
//       proposal._id
//     );

//     window.open(
//       response.pdfUrl,
//       "_blank"
//     );

//   } catch (error) {
//     console.log(error);
//   }
// };

// ------------------------------
// Helper: safely convert array items to string list
// ------------------------------
const toStringList = (items) => {
  if (!items) return [];
  return items.map((item) => {
    if (typeof item === "string") return item;
    if (typeof item === "number") return String(item);
    if (item.description) return item.description;
    if (item.risk) return item.risk;
    if (item.name) return item.name;
    if (item.detail) return item.detail;
    try {
      return JSON.stringify(item);
    } catch {
      return "N/A";
    }
  });
};

// ------------------------------
// Main RFPDetails Component
// ------------------------------
const RFPDetails = () => {
  const { id } = useParams();

  const [rfp, setRfp] = useState(null);
    const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [proposalContent, setProposalContent] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);
  const closeToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);


const handleDownload = async () => {
  try {
    const response = await downloadProposalPdf(
      proposal._id
    );

    console.log(response);
    console.log(
  "DOWNLOAD RESPONSE",
  response
);

    const pdfUrl =
      response?.data?.pdfUrl ||
      response?.pdfUrl;

    if (!pdfUrl) {
      console.log("PDF URL Missing", response);
      return;
    }

    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.log(error);
  }
};

  // Fetch RFP
useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    try {
      const response = await getRFPById(id);

      if (!cancelled) {
        setRfp(response.data);
      }

      try {
        const proposal =
          await getProposalByRfpId(id);

        if (
          !cancelled &&
          proposal?.data?.proposalContent
        ) {
          setProposalContent(
            proposal.data.proposalContent
          );
          setProposal(proposal.data);
        }
      } catch (err) {
        console.log("No proposal found", err);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchData();

  return () => {
    cancelled = true;
  };
}, [id]);

//   const formatArray = (items, field = null) => {
//   if (!items || items.length === 0) return "N/A";

//   return items
//     .map((item) => {
//       if (typeof item === "string") return item;

//       if (field && item[field]) return item[field];

//       if (item.risk) return item.risk;
//       if (item.strategy) return item.strategy;
//       if (item.description) return item.description;
//       if (item.name) return item.name;

//       return "N/A";
//     })
//     .join("\n");
// };

// const formatSimpleList = (items) => {
//   if (!items || items.length === 0) {
//     return "None Specified";
//   }

//   return items.join("\n");
// };

// const formatDevelopmentEffort = (effort) => {
//   if (!effort) return "N/A";

//   return Object.entries(effort)
//     .map(([key, value]) => `${key}: ${value}`)
//     .join("\n");
// };

  // Generate proposal
  const handleGenerateProposal = async () => {
  try {
    setGenerating(true);

    const response = await createProposal({
      rfpId: rfp._id,
    });

   setProposal(response.data);

setProposalContent(
  response.data.proposalContent
);

    showToast(
      "Proposal generated successfully!",
      "success"
    );
  } catch (error) {
    console.error(
      "Proposal generation failed:",
      error
    );

    showToast(
      error?.response?.data?.message ||
        "Failed to generate proposal",
      "error"
    );
  } finally {
    setGenerating(false);
  }
};

  // const downloadProposal = () => {
  //   if (!proposalContent) return;
  //   const blob = new Blob([proposalContent], { type: "text/plain" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `Proposal_${rfp.projectName.replace(/\s+/g, "_")}.txt`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-gray-600 text-lg">Loading RFP details…</span>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800">RFP Not Found</h2>
        <p className="text-gray-500 mt-2">The requested RFP could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{rfp.projectName}</h1>
        <span className="self-start px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {rfp.status}
        </span>
      </div>

      <CollapsibleSection title="Client Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Name" value={rfp.clientName} />
          <InfoItem label="Email" value={rfp.clientEmail} />
          <InfoItem label="Company" value={rfp.clientCompany} />
          <InfoItem label="Status" value={rfp.status} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Requirements Analysis">
        <SubSectionList title="Functional Requirements" items={rfp.requirements?.functionalRequirements} />
        <SubSectionList title="Non‑Functional Requirements" items={rfp.requirements?.nonFunctionalRequirements} />
        <SubSectionList title="Technologies" items={rfp.requirements?.technologies} />
        <div>
          <h3 className="font-semibold text-gray-700">Scope</h3>
          <p className="text-gray-600 mt-1">{safeRenderValue(rfp.requirements?.scope)}</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Business Analysis">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Project Type" value={rfp.businessAnalysis?.projectType} />
          <InfoItem label="Complexity" value={rfp.costEstimation?.complexity} />
        </div>
        <SubSectionList title="Major Modules" items={toStringList(rfp.businessAnalysis?.majorModules)} />
        <SubSectionList title="Key Features" items={toStringList(rfp.businessAnalysis?.keyFeatures)} />
        <SubSectionList title="Dependencies" items={toStringList(rfp.businessAnalysis?.dependencies)} />
        <SubSectionList title="Assumptions" items={toStringList(rfp.businessAnalysis?.assumptions)} />
      </CollapsibleSection>

      <CollapsibleSection title="Risk Analysis">
        <SubSectionList
          title="Technical Risks"
          items={toStringList(rfp.riskAnalysis?.technicalRisks)}
        />
        <SubSectionList
          title="Resource Risks"
          items={toStringList(rfp.riskAnalysis?.resourceRisks)}
        />
        <SubSectionList
          title="Timeline Risks"
          items={toStringList(rfp.riskAnalysis?.timelineRisks)}
        />
        <SubSectionList
          title="Security Risks"
          items={toStringList(rfp.riskAnalysis?.securityRisks)}
        />
        <SubSectionList
          title="Mitigation Strategies"
          items={toStringList(rfp.riskAnalysis?.mitigationStrategies)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Cost Estimation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Complexity" value={rfp.costEstimation?.complexity} />
          <InfoItem label="Team Size" value={rfp.costEstimation?.estimatedTeamSize} />
          <InfoItem label="Duration" value={rfp.costEstimation?.estimatedDuration} />
          <InfoItem label="Estimated Cost" value={rfp.costEstimation?.estimatedCost} />
          <InfoItem label="Development Effort" value={rfp.costEstimation?.developmentEffort} />
        </div>
        <SubSectionList
          title="Recommendations"
          items={toStringList(rfp.costEstimation?.recommendations)}
        />
      </CollapsibleSection>

      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Proposal Document</h2>
          <p className="text-gray-600 text-sm">
            Generate a comprehensive proposal from the analysis above.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateProposal}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              "Generate Proposal"
            )}
          </button>
          {proposalContent && (
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
          )}
        </div>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

// Helper sub-components
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800">{safeRenderValue(value)}</p>
  </div>
);

const SubSectionList = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      <ul className="list-disc ml-6 text-gray-600 space-y-0.5">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default RFPDetails;