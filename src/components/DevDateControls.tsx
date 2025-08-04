import { useState } from 'react';
import { useTaskStore } from '@/state/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from './ui/label';

export function DevDateControls() {
  const { currentDate, nextDay, previousDay, setCurrentDate } = useTaskStore();
  const [year, setYear] = useState(currentDate.getFullYear().toString());
  const [month, setMonth] = useState((currentDate.getMonth() + 1).toString());
  const [day, setDay] = useState(currentDate.getDate().toString());

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
      <CardContent>
        <div className="flex items-end gap-4">
          <Button onClick={previousDay}>Previous Day</Button>
          <Button onClick={nextDay}>Next Day</Button>
        </div>
        <div className="flex items-end gap-2 mt-4">
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" placeholder="YYYY" value={year} onChange={e => setYear(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="month">Month</Label>
            <Input id="month" placeholder="MM" value={month} onChange={e => setMonth(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="day">Day</Label>
            <Input id="day" placeholder="DD" value={day} onChange={e => setDay(e.target.value)} />
          </div>
          <Button onClick={handleGoToDate}>Go</Button>
        </div>
      </CardContent>
    </Card>
  );
}