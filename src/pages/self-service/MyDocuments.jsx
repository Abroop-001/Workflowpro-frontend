import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { selfServiceApi } from '../../api/selfService';
import { documentApi } from '../../api/documents';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { File, Download, Calendar } from 'lucide-react';

export default function MyDocuments() {
  const { success, error } = useToast();
  const { data: documents, loading, error: fetchError, refetch } = useFetch(selfServiceApi.getDocuments);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (id, filename) => {
    setDownloadingId(id);
    try {
      const response = await documentApi.download(id);
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || `document-${id}`;
      link.click();
      success('Document downloaded successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to download document.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <Loading />;
  if (fetchError) return <ErrorState message={fetchError} onRetry={refetch} />;

  const list = documents || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Documents</h1>
          <p className="page-subtitle">View and download your submitted employment documents</p>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="card-padded">
          <EmptyState 
            title="No documents uploaded" 
            description="Your documents will appear here once uploaded and assigned by HR/Admin." 
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {list.map(doc => (
            <Card key={doc._id} className="card-padded" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: '8px', color: 'var(--accent)' }}>
                  <File size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 600, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.documentName || doc.title}>
                    {doc.documentName || doc.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                    Type: <span style={{ fontWeight: 500 }}>{doc.documentType?.replace('_', ' ') || 'OTHER'}</span>
                  </p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <StatusBadge status={doc.verificationStatus || 'PENDING'} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  <span>Added: {new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>

                <button 
                  onClick={() => handleDownload(doc._id, doc.file?.originalName || doc.documentName)} 
                  className="btn btn-secondary btn-sm" 
                  style={{ gap: '6px', display: 'inline-flex', alignItems: 'center' }}
                  disabled={downloadingId === doc._id}
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
