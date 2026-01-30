import { Spinner } from "@/shared/components/icons/svgIcons";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Spinner width={48} stroke="#3b82f6" className="animate-spin" />
                <p className="text-gray-500 font-medium">Loading...</p>
            </div>
        </div>
    );
}
