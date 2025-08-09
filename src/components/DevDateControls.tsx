import { useState } from 'react';
import { useTaskStore } from '@/state/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from './ui/label';

export function DevDateControls() {
  const { viewDate, nextDay, previousDay, setCurrentDate } = useTaskStore();
  const [year, setYear] = useState(viewDate.getFullYear().toString());
  const [month, setMonth] = useState((viewDate.getMonth() + 1).toString());
  const [day, setDay] = useState(viewDate.getDate().toString());

  const handleGoToDate = () => {
    const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
    } else {
      alert('Invalid date!');
    }
  };

  return (
    <Card className="my-6 bg-muted/20">
      <CardHeader>
        <CardTitle className="text-lg">Dev Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={previousDay}>Previous Day</Button>
          <Button onClick={nextDay}>Next Day</Button>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" placeholder="YYYY" value={year} onChange={e => setYear(e.target.value)} className="w-24" />
          </div>
          <div>
            <Label htmlFor="month">Month</Label>
            <Input id="month" placeholder="MM" value={month} onChange={e => setMonth(e.target.value)} className="w-20" />
          </div>
          <div>
            <Label htmlFor="day">Day</Label>
            <Input id="day" placeholder="DD" value={day} onChange={e => setDay(e.target.value)} className="w-20" />
          </div>
          <Button onClick={handleGoToDate}>Go</Button>
        </div>
      </CardContent>
    </Card>
  );
}