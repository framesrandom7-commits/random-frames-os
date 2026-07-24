"use client";

import { PageTitle, SectionTitle, Typography } from "@/components/ui/typography/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ResponsiveFormGrid } from "@/components/ui/form/responsive-form-grid";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/feedback/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";

export default function DesignSystemShowcase() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <PageTitle>Adaptive Design System</PageTitle>
        <Typography variant="body" color="muted" className="mt-2">
          Internal development showcase. Not available in production.
        </Typography>
      </div>

      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>

        {/* TYPOGRAPHY */}
        <TabsContent value="typography" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>Fluid typography responding to viewport sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Display</span>
                <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight">The quick brown fox</h1>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Page Title</span>
                <PageTitle>The quick brown fox</PageTitle>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Section Title</span>
                <SectionTitle>The quick brown fox</SectionTitle>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Body</span>
                <Typography variant="body">The quick brown fox jumps over the lazy dog.</Typography>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUTTONS */}
        <TabsContent value="buttons" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Danger</Button>
              <Button variant="success">Success</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center flex-wrap gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button States</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button responsive>Responsive Width (Full on Mobile)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CARDS */}
        <TabsContent value="cards" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard presentation.</CardDescription>
              </CardHeader>
              <CardContent>Content goes here.</CardContent>
            </Card>

            <Card variant="dashboard">
              <CardHeader>
                <CardTitle>Dashboard Card</CardTitle>
                <CardDescription>Slightly darker for dash grids.</CardDescription>
              </CardHeader>
              <CardContent>Content goes here.</CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover me.</CardDescription>
              </CardHeader>
              <CardContent>Content goes here.</CardContent>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
              </CardHeader>
              <CardContent>Content goes here.</CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FORMS */}
        <TabsContent value="forms" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Responsive Form Grid</CardTitle>
              <CardDescription>Automatically adapts from 1 column to 2 columns on tablet/desktop.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveFormGrid>
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
              </ResponsiveFormGrid>
            </CardContent>
            <CardFooter>
              <Button variant="primary">Submit</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
