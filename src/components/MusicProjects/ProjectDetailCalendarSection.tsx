'use client';

import type { CalendarEvent } from '@/components/Calendar/types';
import type { CalendarEvent as CalendarEventEntity } from '@/entities';
import { CalendarMonth, ChevronLeft, ChevronRight, EventNote } from '@mui/icons-material';
import {
  Box,
  ButtonBase,
  CircularProgress,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  format,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { COLOR_MAP } from '@/components/Calendar/constants';
import { CreateEventPopover } from '@/components/Calendar/CreateEventPopover';
import { DayEventsPopover } from '@/components/Calendar/DayEventsPopover';
import { EventDetailsPopover } from '@/components/Calendar/EventDetailsPopover';
import { MonthPickerPopover } from '@/components/Calendar/MonthPickerPopover';
import { MonthView } from '@/components/Calendar/views/MonthView';
import { ScheduleView } from '@/components/Calendar/views/ScheduleView';
import { YearPickerPopover } from '@/components/Calendar/YearPickerPopover';
import { useGetCalendarEventsByProject } from '@/queries/hooks/calendar-events/useGetCalendarEventsByProject';
import { getButtonGroupSx } from '@/utils/buttonGroupStyles';

type ProjectDetailCalendarSectionProps = {
  locale: string;
  projectId: number;
  readOnly?: boolean;
};

type SectionViewMode = 'calendar' | 'upcoming';

function eventColor(color: string | null): string {
  if (!color) {
    return '#6b7280';
  }
  return COLOR_MAP[color] ?? color;
}

function isAllDayEvent(start: Date, end: Date): boolean {
  return (
    start.getHours() === 0
    && start.getMinutes() === 0
    && ((end.getHours() === 23 && end.getMinutes() === 59)
      || (end.getHours() === 0 && end.getMinutes() === 0))
  );
}

function getUpcomingEvents(events: CalendarEvent[]): CalendarEvent[] {
  const today = startOfDay(new Date());
  return [...events]
    .filter(e => parseISO(e.start) >= today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return events.filter((e) => {
    const start = format(new Date(e.start), 'yyyy-MM-dd');
    const end = format(new Date(e.end), 'yyyy-MM-dd');
    return (dateStr >= start && dateStr <= end) || start === dateStr;
  });
}

function toCalendarEvents(entities: CalendarEventEntity[] | undefined): CalendarEvent[] {
  if (!entities) {
    return [];
  }
  return entities.map(e => ({
    id: e.id,
    assetId: e.assetId,
    musicProjectId: e.musicProjectId,
    userId: e.userId,
    name: e.name,
    description: e.description,
    location: e.location,
    color: e.color,
    start: e.start,
    end: e.end,
    reminders: e.reminders,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));
}

type ProjectNextEventCardProps = {
  event: CalendarEvent;
  onClick: (event: CalendarEvent, anchorEl: HTMLElement) => void;
};

function ProjectNextEventCard({ event, onClick }: ProjectNextEventCardProps) {
  const tCal = useTranslations('Calendar');
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const allDay = isAllDayEvent(startDate, endDate);
  const color = eventColor(event.color);

  const dateLabel = format(startDate, 'MMM d, yyyy');
  const timeLabel = allDay
    ? tCal('all_day')
    : `${format(startDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`;

  return (
    <Box
      component="button"
      type="button"
      onClick={e => onClick(event, e.currentTarget)}
      sx={{
        'width': '100%',
        'p': 1.25,
        'border': 'none',
        'borderRadius': 1.5,
        'textAlign': 'left',
        'cursor': 'pointer',
        'bgcolor': `${color}20`,
        'borderLeft': '3px solid',
        'borderLeftColor': color,
        'transition': 'opacity 0.15s ease',
        '&:hover': { opacity: 0.9 },
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
        {dateLabel}
        {' · '}
        {timeLabel}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap>
        {event.name}
      </Typography>
      {event.location && (
        <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mt: 0.25 }}>
          {event.location}
        </Typography>
      )}
    </Box>
  );
}

export function ProjectDetailCalendarSection({
  locale,
  projectId,
  readOnly = false,
}: ProjectDetailCalendarSectionProps) {
  const t = useTranslations('MusicProjects');
  const tCal = useTranslations('Calendar');
  const theme = useTheme();
  const buttonGroupSx = getButtonGroupSx(theme);

  const { data, isLoading, error, refetch } = useGetCalendarEventsByProject(locale, projectId);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[] | null>(null);
  const events = localEvents ?? toCalendarEvents(data);

  const [sectionView, setSectionView] = useState<SectionViewMode>('calendar');
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));
  const [monthSlideDirection, setMonthSlideDirection] = useState<'prev' | 'next' | null>(null);
  const [monthSlideToDate, setMonthSlideToDate] = useState<Date | null>(null);
  const [headerPickerAnchor, setHeaderPickerAnchor] = useState<HTMLElement | null>(null);
  const [headerPickerType, setHeaderPickerType] = useState<'year' | 'month' | null>(null);
  const [dayPopoverAnchor, setDayPopoverAnchor] = useState<HTMLElement | null>(null);
  const [dayPopoverDate, setDayPopoverDate] = useState<Date | null>(null);
  const [createPopoverAnchor, setCreatePopoverAnchor] = useState<HTMLElement | null>(null);
  const [createPopoverDate, setCreatePopoverDate] = useState<Date | undefined>(undefined);
  const [eventDetailsAnchor, setEventDetailsAnchor] = useState<HTMLElement | null>(null);
  const [eventDetailsAnchorPosition, setEventDetailsAnchorPosition] = useState<{ top: number; left: number } | null>(null);
  const [eventDetailsEvent, setEventDetailsEvent] = useState<CalendarEvent | null>(null);
  const [editPopoverAnchor, setEditPopoverAnchor] = useState<HTMLElement | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const nextEvent = upcomingEvents[0] ?? null;

  const tHeader = tCal as (key: string) => string;

  const handleEventsUpdate = (updated: CalendarEvent[]) => {
    setLocalEvents(updated);
    void refetch();
  };

  const handleDayClick = (date: Date, anchorEl?: HTMLElement) => {
    if (anchorEl != null) {
      setDayPopoverAnchor(anchorEl);
      setDayPopoverDate(date);
    }
  };

  const handleEventClick = (
    event: CalendarEvent,
    anchorEl: HTMLElement,
    anchorPosition?: { x: number; y: number },
  ) => {
    setEventDetailsAnchor(anchorEl);
    setEventDetailsAnchorPosition(anchorPosition ? { top: anchorPosition.y, left: anchorPosition.x } : null);
    setEventDetailsEvent(event);
  };

  const handlePrev = () => setMonthSlideDirection('prev');
  const handleNext = () => setMonthSlideDirection('next');
  const handleToday = () => setCurrentDate(startOfMonth(new Date()));

  const toolbarSx = useMemo(() => ({
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1.5,
  }), []);

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('calendar')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={sectionView}
          onChange={(_, value: SectionViewMode | null) => {
            if (value != null) {
              setSectionView(value);
            }
          }}
          sx={buttonGroupSx}
        >
          <ToggleButton value="calendar" aria-label={t('calendar_view_month')}>
            <CalendarMonth fontSize="small" />
          </ToggleButton>
          <ToggleButton value="upcoming" aria-label={t('calendar_view_upcoming')}>
            <EventNote fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ py: 2 }}>
          {error instanceof Error ? error.message : 'Failed to load calendar'}
        </Typography>
      )}

      {!isLoading && !error && sectionView === 'calendar' && (
        <>
          {nextEvent && (
            <Box sx={{ mb: 2 }}>
              <ProjectNextEventCard event={nextEvent} onClick={handleEventClick} />
            </Box>
          )}

          <Box sx={toolbarSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', minWidth: 0 }}>
              <ButtonBase
                component="button"
                type="button"
                onClick={(e) => {
                  setHeaderPickerAnchor(e.currentTarget);
                  setHeaderPickerType('month');
                }}
                aria-haspopup="dialog"
                aria-expanded={headerPickerAnchor != null && headerPickerType === 'month'}
                aria-label={tHeader('select_month')}
                sx={{
                  'borderRadius': 1,
                  'px': 0.5,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {format(currentDate, 'MMMM')}
                </Typography>
              </ButtonBase>
              <ButtonBase
                component="button"
                type="button"
                onClick={(e) => {
                  setHeaderPickerAnchor(e.currentTarget);
                  setHeaderPickerType('year');
                }}
                aria-haspopup="dialog"
                aria-expanded={headerPickerAnchor != null && headerPickerType === 'year'}
                aria-label={tHeader('select_year')}
                sx={{
                  'borderRadius': 1,
                  'px': 0.5,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {format(currentDate, 'yyyy')}
                </Typography>
              </ButtonBase>
            </Box>

            <ToggleButtonGroup
              exclusive
              size="small"
              sx={buttonGroupSx}
              onChange={(_, value) => {
                if (value === 'prev') {
                  handlePrev();
                } else if (value === 'today') {
                  handleToday();
                } else if (value === 'next') {
                  handleNext();
                }
              }}
            >
              <ToggleButton value="prev" aria-label="previous">
                <ChevronLeft fontSize="small" />
              </ToggleButton>
              <ToggleButton value="today" aria-label={tCal('today')}>
                <Typography variant="caption">
                  {tCal('today')}
                </Typography>
              </ToggleButton>
              <ToggleButton value="next" aria-label="next">
                <ChevronRight fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <MonthView
            variant="compact"
            currentDate={currentDate}
            onCurrentDateChange={setCurrentDate}
            events={events}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            locale={locale}
            slideDirection={monthSlideDirection}
            onSlideDirectionComplete={() => setMonthSlideDirection(null)}
            slideToDate={monthSlideToDate}
            onSlideToMonthComplete={() => setMonthSlideToDate(null)}
          />
        </>
      )}

      {!isLoading && !error && sectionView === 'upcoming' && (
        <ScheduleView
          events={events}
          onEventClick={handleEventClick}
          variant="compact"
          locale={locale}
        />
      )}

      {headerPickerAnchor != null && headerPickerType === 'year' && (
        <YearPickerPopover
          open
          anchorEl={headerPickerAnchor}
          onClose={() => {
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          currentYear={currentDate.getFullYear()}
          onSelect={(year) => {
            setCurrentDate(new Date(year, currentDate.getMonth(), 1));
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          locale={locale}
        />
      )}

      {headerPickerAnchor != null && headerPickerType === 'month' && (
        <MonthPickerPopover
          open
          anchorEl={headerPickerAnchor}
          onClose={() => {
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          currentDate={currentDate}
          onSelect={(monthIndex) => {
            setMonthSlideToDate(new Date(currentDate.getFullYear(), monthIndex, 1));
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          locale={locale}
        />
      )}

      {dayPopoverAnchor != null && dayPopoverDate != null && (
        <DayEventsPopover
          open
          anchorEl={dayPopoverAnchor}
          date={dayPopoverDate}
          events={getEventsForDate(events, dayPopoverDate)}
          onClose={() => {
            setDayPopoverAnchor(null);
            setDayPopoverDate(null);
          }}
          showCreateEvent={!readOnly}
          onCreateEvent={(date) => {
            setCreatePopoverAnchor(dayPopoverAnchor);
            setCreatePopoverDate(date);
            setDayPopoverAnchor(null);
            setDayPopoverDate(null);
          }}
          onEventClick={(ev) => {
            const dayAnchor = dayPopoverAnchor;
            setDayPopoverAnchor(null);
            setDayPopoverDate(null);
            handleEventClick(ev, dayAnchor);
          }}
          locale={locale}
        />
      )}

      {createPopoverAnchor != null && (
        <CreateEventPopover
          open
          anchorEl={createPopoverAnchor}
          onClose={() => {
            setCreatePopoverAnchor(null);
            setCreatePopoverDate(undefined);
          }}
          initialDate={createPopoverDate}
          musicProjectId={projectId}
          locale={locale}
          onCreateSuccess={(event) => {
            handleEventsUpdate([...events, event]);
            setCreatePopoverAnchor(null);
            setCreatePopoverDate(undefined);
          }}
        />
      )}

      {eventDetailsAnchor != null && eventDetailsEvent != null && (
        <EventDetailsPopover
          open
          anchorEl={eventDetailsAnchor}
          anchorPosition={eventDetailsAnchorPosition}
          event={eventDetailsEvent}
          showAssetCard={false}
          onClose={() => {
            setEventDetailsAnchor(null);
            setEventDetailsAnchorPosition(null);
            setEventDetailsEvent(null);
          }}
          onEdit={readOnly
            ? undefined
            : () => {
                if (!eventDetailsEvent || !eventDetailsAnchor) {
                  return;
                }
                setEditingEvent(eventDetailsEvent);
                setEditPopoverAnchor(eventDetailsAnchor);
                setEventDetailsAnchor(null);
                setEventDetailsEvent(null);
              }}
          locale={locale}
        />
      )}

      {editPopoverAnchor != null && editingEvent != null && (
        <CreateEventPopover
          open
          anchorEl={editPopoverAnchor}
          onClose={() => {
            setEditPopoverAnchor(null);
            setEditingEvent(null);
          }}
          musicProjectId={projectId}
          locale={locale}
          mode="edit"
          event={editingEvent}
          onSuccess={(updated) => {
            handleEventsUpdate(events.map(e => (e.id === updated.id ? updated : e)));
            setEditPopoverAnchor(null);
            setEditingEvent(null);
          }}
          onDeleteSuccess={(eventId) => {
            handleEventsUpdate(events.filter(e => e.id !== eventId));
            setEditPopoverAnchor(null);
            setEditingEvent(null);
          }}
        />
      )}
    </Box>
  );
}
