import React, { useRef, useEffect } from 'react';

interface Dataset {
    label: string;
    data: number[];
    color: string;
}

interface CanvasChartProps {
    width?: number;
    height?: number;
    datasets: Dataset[];
    labels?: (string | number)[];
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    minY?: number;
    maxY?: number;
    className?: string;
}

const CanvasChart: React.FC<CanvasChartProps> = ({
    width,
    height = 300,
    datasets,
    labels,
    title,
    yAxisLabel,
    xAxisLabel,
    minY = 0,
    maxY = 100,
    className = ""
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = React.useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get responsive width
        const actualWidth = width || container.clientWidth;
        const actualHeight = height;

        // Set canvas size
        canvas.width = actualWidth;
        canvas.height = actualHeight;

        // Clear canvas (no background fill)
        ctx.clearRect(0, 0, actualWidth, actualHeight);

        // Chart dimensions
        const padding = 60;
        const chartWidth = actualWidth - padding * 2;
        const chartHeight = actualHeight - padding * 2;
        const chartX = padding;
        const chartY = padding;

        // Grid and axes
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;

        // Draw grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = chartY + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(chartX, y);
            ctx.lineTo(chartX + chartWidth, y);
            ctx.stroke();
        }

        // Draw axes
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(chartX, chartY);
        ctx.lineTo(chartX, chartY + chartHeight);
        ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
        ctx.stroke();

        // Draw title
        if (title) {
            ctx.fillStyle = '#f9fafb';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, actualWidth / 2, 25);
        }

        // Draw axis labels
        ctx.fillStyle = '#d1d5db';
        ctx.font = '12px sans-serif';

        if (yAxisLabel) {
            ctx.save();
            ctx.translate(15, actualHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText(yAxisLabel, 0, 0);
            ctx.restore();
        }

        if (xAxisLabel) {
            ctx.textAlign = 'center';
            ctx.fillText(xAxisLabel, actualWidth / 2, actualHeight - 10);
        }

        // Draw Y-axis labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= gridLines; i++) {
            const value = maxY - ((maxY - minY) / gridLines) * i;
            const y = chartY + (chartHeight / gridLines) * i;
            ctx.fillText(value.toFixed(0), chartX - 10, y + 3);
        }

        // Draw datasets
        if (datasets.length > 0 && datasets[0].data.length > 0) {
            const dataLength = datasets[0].data.length;
            
            datasets.forEach((dataset) => {
                ctx.strokeStyle = dataset.color;
                ctx.lineWidth = 2;
                ctx.beginPath();

                dataset.data.forEach((value, index) => {
                    const x = chartX + (chartWidth / (dataLength - 1)) * index;
                    const normalizedValue = Math.max(minY, Math.min(maxY, value));
                    const y = chartY + chartHeight - ((normalizedValue - minY) / (maxY - minY)) * chartHeight;

                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();

                // Draw points
                ctx.fillStyle = dataset.color;
                dataset.data.forEach((value, index) => {
                    const x = chartX + (chartWidth / (dataLength - 1)) * index;
                    const normalizedValue = Math.max(minY, Math.min(maxY, value));
                    const y = chartY + chartHeight - ((normalizedValue - minY) / (maxY - minY)) * chartHeight;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                });
            });
        }

        // Draw legend
        if (datasets.length > 1) {
            const legendY = chartY + chartHeight + 30;
            let legendX = chartX;
            
            datasets.forEach((dataset, index) => {
                ctx.fillStyle = dataset.color;
                ctx.fillRect(legendX, legendY, 12, 12);
                
                ctx.fillStyle = '#f9fafb';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(dataset.label, legendX + 20, legendY + 9);
                
                legendX += ctx.measureText(dataset.label).width + 50;
            });
        }

    }, [datasets, width, height, title, yAxisLabel, xAxisLabel, minY, maxY, containerWidth]);

    // Handle resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateWidth = () => {
            setContainerWidth(container.clientWidth);
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`w-full ${className}`}
            style={{ height: `${height}px` }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    backgroundColor: 'transparent'
                }}
            />
        </div>
    );
};

export default CanvasChart;
